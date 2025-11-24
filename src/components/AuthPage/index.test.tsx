import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AuthPage from './index';
import authReducer from '@/slices/authSlice';
import { showNotification } from '@/components/notify';

const mockRouter = { push: jest.fn() };
jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}));

jest.mock('@/svgs', () => ({
    Envelope: () => <svg data-testid="envelope-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
}));

jest.mock('@/context/ThemeContext', () => ({
    useTheme: () => ({ theme: 'dark' }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: jest.fn() },
    }),
}));

jest.mock('@/components/notify', () => ({
    showNotification: jest.fn(),
}));

const mockFetch = global.fetch;

const createStore = (mode: 'signup' | 'signin') =>
    configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
            auth: { user: null, userAuth: false, authMode: mode, expiresAt: null },
        },
    });

const renderWithProviders = (children: React.ReactElement, store: ReturnType<typeof createStore>) =>
    render(<Provider store={store}>{children}</Provider>);

describe('tests for AuthPage component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRouter.push.mockClear();
        (showNotification as jest.Mock).mockClear();

        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = mockFetch;
    });

    it('renders signup page', () => {
        const store = createStore('signup');
        renderWithProviders(<AuthPage mode="signup" />, store);
        expect(screen.getByText('createAccount')).toBeInTheDocument();
    });

    it('submits signup form and redirects to signin', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({}),
        });

        const store = createStore('signup');
        renderWithProviders(<AuthPage mode="signup" />, store);

        fireEvent.change(screen.getByTestId("email"), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByTestId("password"), { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@gmail.com', password: '123456' }),
            });
        });

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('signUpSuccess', 'success', 2000);
            expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
        });
    });

    it('shows error when signup fails(user exists)', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Signup failed'));

        const store = createStore('signup');
        renderWithProviders(<AuthPage mode="signup" />, store);

        fireEvent.change(screen.getByTestId("email"), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByTestId("password"), { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('userExists', 'error', 3000);
        });
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('submits signin form and redirects to main', async () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNjk4NzY1NDMyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                user: { id: 1, username: 'user' },
                token: token,
            }),
        });

        const store = createStore('signin');
        renderWithProviders(<AuthPage mode="signin" />, store);

        fireEvent.change(screen.getByTestId("email"), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByTestId("password"), { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@gmail.com', password: '123456' }),
            });
        });

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('signInSuccess', 'success', 2000);
            expect(mockRouter.push).toHaveBeenCalledWith('/');
        });
    });
    it('shows error when signin fails(invalid data input)', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Login failed'));

        const store = createStore('signin');
        renderWithProviders(<AuthPage mode="signin" />, store);

        fireEvent.change(screen.getByTestId("email"), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByTestId("password"), { target: { value: '111111' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('invalidCredentials', 'error', 3000);
        });
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('switches auth mode', () => {
        const store = createStore('signup');
        renderWithProviders(<AuthPage mode="signup" />, store);
        fireEvent.click(screen.getByText('alreadyHaveAccount'));
        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
    });
});