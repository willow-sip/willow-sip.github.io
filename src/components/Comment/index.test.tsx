import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice, { AuthState } from '@/slices/authSlice';
import Comment from './index';
import { tokenApi } from '@/tokenApi';

jest.mock('@/tokenApi', () => ({
  tokenApi: {
    delete: jest.fn(),
  },
}));

const createStore = (state: Partial<AuthState> = {}) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        user: null,
        userAuth: false,
        authMode: null,
        expiresAt: null,
        ...state,
      },
    },
  });
};

const queryClient = new QueryClient();

const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@mail.ru',
    password: '12345'
};

const renderWithProviders = ( children: React.ReactNode, store = createStore({ user: mockUser, userAuth: true }) ) =>
    render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );

describe('tests for Comment component', () => {
  it('renders comment text', () => {
    renderWithProviders(<Comment id={1} authorId={1} text="Test comment" />);
    expect(screen.getByText("Test comment")).toBeInTheDocument();
  });

  it('if current user is author of the comment, shows buttons to edit and delete', () => {
    renderWithProviders(<Comment id={1} authorId={1} text="Test comment" />);
    expect(screen.getByTestId("edit-button")).toBeInTheDocument();
    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
  });

  it('starts editing correctly', () => {
    renderWithProviders(<Comment id={1} authorId={1} text="Comment to edit" />);
    fireEvent.click(screen.getByTestId('edit-button'));
    expect(screen.getByRole('textbox')).toHaveValue('Comment to edit');
  });

  it('deletes the comment correctly', async () => {
    (tokenApi.delete as jest.Mock).mockResolvedValueOnce({});
    const deleteComm = jest.fn();
    renderWithProviders(<Comment id={1} authorId={1} text="Comment to delete" deleteComm={deleteComm} />);

    fireEvent.click(screen.getByTestId('delete-button'));
    await waitFor(() => {
        expect(tokenApi.delete).toHaveBeenCalledWith('/comments/1');
        expect(deleteComm).toHaveBeenCalled();
    });

  });
});
