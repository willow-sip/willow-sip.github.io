'use client';

import { useEffect } from 'react';
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

const Notification = ({ message, type, isVisible = false, close, autoHide = 4000 }: Props) => {
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            close();
        }, autoHide);

        return () => clearTimeout(timer);
    }, [isVisible, autoHide, close]);

    if (!isVisible) return null;

    const typeClass =
        type === 'success'
            ? styles.success
            : type === 'error'
                ? styles.error
                : styles.warning;

    const notificationElement = (
        <div data-testid="notification" className={`${styles.notification} ${typeClass}`}>
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
                    onClick={close}
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
