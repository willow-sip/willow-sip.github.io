import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from './index';
import { tokenApi } from '@/tokenApi';
import { showNotification } from '@/components/notify';
import { User } from '@/data/datatypes';

jest.mock('@/svgs', () => ({
    Envelope: () => <svg data-testid="envelope-icon" />,
    Important: () => <svg data-testid="important-icon" />,
    Pencil: () => <svg data-testid="pencil-icon" />,
    Person: () => <svg data-testid="person-icon" />,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@/tokenApi', () => ({
    tokenApi: {
        post: jest.fn(),
    },
}));

jest.mock('@/components/notify', () => ({
    showNotification: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: jest.fn(),
        },
    }),
}));

const mockToggleTheme = jest.fn();
jest.mock('@/context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
    }),
}));

const createMockStore = (user: User) =>
    configureStore({
        reducer: {
            auth: () => ({ user }),
        },
    });

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (children: React.ReactElement, store: ReturnType<typeof configureStore>) => {
    return render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );
};

describe('tests for Profile component', () => {
    const mockUser: User = {
        id: 0,
        username: 'admin',
        email: 'admin@mail.ru',
        password: '12345',
        description: "Some test description",
        profileImage: '/assets/test.png'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('fills the form with current data when loaded', () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);

        expect(screen.getByTestId('username')).toHaveValue("admin");
        expect(screen.getByTestId('email')).toHaveValue("admin@mail.ru");
        expect(screen.getByTestId('description')).toHaveValue("Some test description");
        expect(screen.getByTestId('profile-image-preview')).toHaveAttribute('src', expect.stringContaining('assets%2Ftest.png'));
    });

    it('submits changes in data', async () => {
        const store = createMockStore(mockUser);
        const dispatch = jest.fn();
        store.dispatch = dispatch;

        renderWithProviders(<Profile />, store);

        fireEvent.change(screen.getByTestId('username'), { target: { value: 'usernameNew' } });
        fireEvent.change(screen.getByTestId('email'), { target: { value: 'adminNew@mail.ru' } });
        fireEvent.change(screen.getByTestId('description'), { target: { value: 'Some different description' } });

        await act(async () => { fireEvent.submit(screen.getByTestId('update-profile')) });

        await waitFor(() => {
            expect(tokenApi.post).toHaveBeenCalledWith('/graphql', expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProfile'),
                variables: expect.objectContaining({
                    input: expect.objectContaining({
                        username: 'usernameNew',
                        email: 'adminNew@mail.ru',
                        description: 'Some different description',
                    }),
                }),
            }));
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'auth/updateUser' })
        );
        expect(showNotification).toHaveBeenCalledWith('updatedProfile', 'success', 2000);
    });

    it('shows notifications when form data is invalid', async () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);

        fireEvent.change(screen.getByTestId('username'), { target: { value: '' } });
        fireEvent.change(screen.getByTestId('email'), { target: { value: 'blablabla' } });

        await act(async () => { fireEvent.submit(screen.getByTestId('update-profile')) });

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('inputUsername', 'error', 3000);
            expect(showNotification).toHaveBeenCalledWith('inputValidEmail', 'error', 3000);
        });
    });

    it('uploads and validates profile image file', () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);

        const fileInput = screen.getByTestId('change-photo');

        const validFile = new File(['its a photo i swear'], 'avatar.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        expect(screen.getByTestId('profile-image-preview')).toHaveAttribute('src', expect.stringContaining('blob:test-url'));

        const invalidFile = new File(['its not a photo'], 'text.txt', { type: 'text/plain' });
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
        expect(showNotification).toHaveBeenCalledWith('invalidFileType', 'error', 3000);

        const bigFile = new File(['test'.repeat(11 * 1024 * 1024)], 'big.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [bigFile] } });
        expect(showNotification).toHaveBeenCalledWith('fileSizeExceeded', 'error', 3000);
    });

    it('changes theme', () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('navigates to statistics page', () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);

        fireEvent.click(screen.getByTestId('statistics'));
        expect(mockPush).toHaveBeenCalledWith('/statistics');
    });

    it('logs out and redirects to home', () => {
        const store = createMockStore(mockUser);
        renderWithProviders(<Profile />, store);

        fireEvent.click(screen.getByText('Logout'));
        expect(mockPush).toHaveBeenCalledWith('/');
    });
});