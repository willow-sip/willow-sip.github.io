'use client';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, useState } from 'react';
import Notification from './index';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning';
    autoHide?: number;
}

jest.mock('@/svgs', () => ({
    SuccessCheck: () => <svg data-testid="success-icon" />,
    Cross: () => <svg data-testid="error-icon" />,
    Warning: () => <svg data-testid="warning-icon" />,
}));

const NotificationTestContainer = ({ message, type, autoHide = 4000 }: NotificationProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const close = () => setIsVisible(false);

    return (
        <Notification
            message={message}
            type={type}
            isVisible={isVisible}
            close={close}
            autoHide={autoHide}
        />
    );
};

const createPortalRoot = () => {
    const el = document.createElement('div');
    el.id = 'notification-root';
    return el;
};

describe('tests for Notification component', () => {
    let portalRoot: HTMLDivElement;

    beforeEach(() => {
        const existing = document.getElementById('notification-root');
        if (existing) existing.remove();

        portalRoot = createPortalRoot();
        document.body.appendChild(portalRoot);
    });

    afterEach(() => {
        if (portalRoot.parentNode) {
            portalRoot.parentNode.removeChild(portalRoot);
        }
        jest.clearAllMocks();
    });

    it('doesnt render when isVisible is false', () => {
        render(
            <Notification
                message="Test message"
                type="success"
                isVisible={false}
                close={jest.fn()}
            />
        );
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('renders success notification', () => {
        render(<NotificationTestContainer message="Operation successful!" type="success" />);

        expect(screen.getByText('Operation successful!')).toBeInTheDocument();
        expect(screen.getByTestId('success-icon')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    it('renders error notification', () => {
        render(<NotificationTestContainer message="Something went wrong" type="error" />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('renders warning notification', () => {
        render(<NotificationTestContainer message="Be careful!" type="warning" />);

        expect(screen.getByText('Be careful!')).toBeInTheDocument();
        expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('closes when close button is clicked', async () => {
        const closeMock = jest.fn();
        render(
            <Notification
                message="Close me"
                type="success"
                isVisible={true}
                close={closeMock}
            />
        );

        const closeButton = screen.getByTestId("close-button");
        await userEvent.click(closeButton);

        expect(closeMock).toHaveBeenCalledTimes(1);
    });

    it('auto-hides after default 4 seconds', async () => {
        jest.useFakeTimers();
        render(<NotificationTestContainer message="Auto-hide" type="success" />);

        expect(screen.getByText('Auto-hide')).toBeInTheDocument();
        act(() => { jest.advanceTimersByTime(4000) });

        await waitFor(() => { expect(screen.queryByText('Auto-hide')).not.toBeInTheDocument() });
        jest.useRealTimers();
    });

    it('auto-hides after custom duration', async () => {
        jest.useFakeTimers();
        render(
            <NotificationTestContainer
                message="Custom auto-hide"
                type="warning"
                autoHide={2000}
            />
        );

        expect(screen.getByText('Custom auto-hide')).toBeInTheDocument();
        act(() => { jest.advanceTimersByTime(2000) });

        await waitFor(() => { expect(screen.queryByText('Custom auto-hide')).not.toBeInTheDocument() });
        jest.useRealTimers();
    });

    it('closes when close button is clicked before autoHide', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(
            <NotificationTestContainer
                message="Click to close"
                type="success"
                autoHide={5000}
            />
        );

        const closeButton = screen.getByTestId("close-button");
        await user.click(closeButton);
        await waitFor(() => expect(screen.queryByText('Click to close')).not.toBeInTheDocument());

        act(() => { jest.advanceTimersByTime(6000) });
        expect(screen.queryByText('Click to close')).not.toBeInTheDocument();
        jest.useRealTimers();
    });

});