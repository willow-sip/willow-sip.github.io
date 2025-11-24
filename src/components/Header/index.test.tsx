import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import Header from './index';
import authReducer, { AuthState } from '@/slices/authSlice';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(() => '/'),
}));

const mockToggleTheme = jest.fn();
jest.mock('@/context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
    }),
}));

jest.mock('@/svgs', () => ({
    BurgerMenu: () => <svg data-testid="burger" />,
    Logout: () => <svg data-testid="logout" />,
    Moon: () => <svg data-testid="moon" />,
    Sun: () => <svg data-testid="sun" />,
}));

jest.mock('../LangToggler', () => () => <div data-testid="lang-toggler" />);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('tests for Header component', () => {
    const pushMock = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        pushMock.mockClear();
        mockToggleTheme.mockClear();
    });

    const renderWithStore = (preloadedState?: { auth: AuthState }) => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState,
        });

        return render(
            <Provider store={store}>
                <Header />
            </Provider>
        );
    };

    it('when user isnt authorized renders sign in/up buttons', () => {
        renderWithStore({ auth: { user: null, userAuth: false, authMode: null, expiresAt: null } });

        expect(screen.getByText('signUp')).toBeInTheDocument();
        expect(screen.getByText('signIn')).toBeInTheDocument();
        expect(screen.getByTestId('sun')).toBeInTheDocument();
    });

    it('when user is authorized renders user info and logout button', () => {
        renderWithStore({
            auth: {
                userAuth: true,
                user: { id: 0, username: "blaba", firstName: 'Diana', secondName: 'Loyuk', profileImage: '/avatar.jpg' },
                authMode: null,
                expiresAt: Date.now(),
            },
        });

        expect(screen.getByText('Diana Loyuk')).toBeInTheDocument();
        expect(screen.getByAltText('User avatar')).toHaveAttribute('src', expect.stringContaining('avatar.jpg'));
        expect(screen.getByTestId('logout')).toBeInTheDocument();
    });

    it('correctly handles log out when button is clicked', async () => {
        const localStorageMock = {
            removeItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: {
                    user: { id: 0, username: 'admin' },
                    userAuth: true,
                    authMode: null,
                    expiresAt: Date.now() + 10000,
                },
            },
        });

        render(
            <Provider store={store}>
                <Header />
            </Provider>
        );

        const logoutBtn = screen.getByTestId('logout');
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            const state = store.getState().auth;
            expect(state.userAuth).toBe(false);
            expect(state.user).toBeNull();
        });

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('expiresAt');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('handles navigation when buttons are clicked', () => {
        renderWithStore({
            auth: { user: null, userAuth: false, authMode: null, expiresAt: null },
        });

        fireEvent.click(screen.getByText('signUp'));
        fireEvent.click(screen.getByText('signIn'));

        expect(pushMock).toHaveBeenCalledWith('/sign-up');
        expect(pushMock).toHaveBeenCalledWith('/sign-in');
    });

    it('toggles theme when theme button is clicked', () => {
        renderWithStore();
        fireEvent.click(screen.getByTestId('sun'));
        expect(mockToggleTheme).toHaveBeenCalled(); 
    });
});
