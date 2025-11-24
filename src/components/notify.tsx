import { createRoot } from 'react-dom/client';
import Notification from '@/components/Notification';

let container: HTMLElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

let notifications: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning';
    autoHide: number;
}> = [];

const getContainer = () => {
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.getElementById('notification-root')?.appendChild(container);
    }
    return container;
};

const render = () => {
    const container = getContainer();

    if (!root) {
        root = createRoot(container);
    }

    root.render(
        <>
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    isVisible={true}
                    autoHide={notification.autoHide}
                    close={() => {
                        notifications = notifications.filter(x => x.id !== notification.id);
                        render();
                    }}
                />
            ))}
        </>
    );
};

export const showNotification = (message: string, type: 'success' | 'error' | 'warning', autoHide: number = 4000) => {
    const id = Date.now();
    notifications.push({ id, message, type, autoHide });

    render();

    return () => {
        notifications = notifications.filter(n => n.id !== id);
        render();
    };
};