'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cross, SuccessCheck, Warning } from '@/svgs';
import styles from './style.module.css';

interface Props {
    message: string;
    type: 'success' | 'error' | 'warning';
    isVisible: boolean;
    close: () => void;
    autoHide?: number;
}

const Notification = ({ message, type, isVisible = false, close, autoHide }: Props) => {
    const [isClosing, setIsClosing] = useState(false);

     useEffect(() => {
        if (isVisible) {
            setIsClosing(false);
        }
    }, [isVisible]);
    
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            handleClose();
        }, autoHide);

        return () => clearTimeout(timer);
    }, [isVisible, isClosing, autoHide]);

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            close();
        }, 300);
    };

    if (!isVisible && !isClosing) return null;

    const typeClass =
        type === 'success'
            ? styles.success
            : type === 'error'
                ? styles.error
                : styles.warning;

    const animationClass = isClosing ? styles.slideOut : styles.slideIn;

    const notificationElement = (
        <div data-testid="notification" className={`${styles.notification} ${typeClass} ${animationClass}`}>
            <div className={styles.notificationContent}>
                <span className={styles.notificationIcon}>
                    {type === 'success' && <SuccessCheck />}
                    {type === 'error' && <Cross />}
                    {type === 'warning' && <Warning />}
                </span>
                <p className={styles.notificationMessage}>{message}</p>
                <button
                    data-testid="close-button"
                    className={styles.notificationClose}
                    onClick={handleClose}
                >
                    ×
                </button>
            </div>
        </div>
    );

    const portalRoot =
        typeof window !== 'undefined'
            ? document.getElementById('notification-root')
            : null;

    return portalRoot ? createPortal(notificationElement, portalRoot) : null;
};

export default Notification;
