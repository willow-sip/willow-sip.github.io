'use client';

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnwrappedPost as Post } from './index';
import { tokenApi } from '@/tokenApi';
import { TFunction } from 'i18next';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User } from '@/data/datatypes';

jest.mock('@/context/ThemeContext', () => ({
    useTheme: {
        getState: () => ({ theme: 'light' })
    }
}));

jest.mock('@/components/notify', () => ({
    showNotification: jest.fn(),
}));

jest.mock('@/tokenApi', () => ({
    tokenApi: {
        get: jest.fn(),
        post: jest.fn(),
    }
}));

jest.mock('@/svgs', () => ({
    ArrowDown: () => <div data-testid="arrow-down" />,
    ArrowUp: () => <div data-testid="arrow-up" />,
    CommentSvg: () => <div data-testid="comment-svg" />,
    LikeSvg: () => <div data-testid="like" />,
    Pencil: () => <div data-testid="pencil" />,
}));

const mockT = Object.assign(
    (key: string) => key,
    { $TFunctionBrand: undefined }
) as TFunction;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

const mockPost = {
    id: 1,
    authorId: 10,
    title: 'Test post',
    content: 'Some post content',
    image: '/post.png',
    likesCount: 5,
    commentsCount: 2,
    creationDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
};

const mockUser = {
    id: 0,
    username: 'admin',
};

const mockAuthor = {
    id: 10,
    firstName: 'Diana',
    secondName: 'Loyuk',
    profileImage: '/pic.png',
};

const mockComments = [
    { id: 1, text: 'Cool comment', authorId: 10, postId: 1 },
    { id: 2, text: 'Bad comment', authorId: 0, postId: 1 },
];

const createMockStore = (user: User) =>
    configureStore({
        reducer: {
            auth: () => ({ user }),
        },
    });

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const renderPostWithProviders = (store: ReturnType<typeof configureStore>) => {
    return render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Post post={mockPost} user={mockUser} t={mockT} userAuth={true} />
            </QueryClientProvider>
        </Provider>
    );
};

describe('tests for Post component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (tokenApi.get as jest.Mock).mockImplementation((url: string) => {
            return Promise.resolve(url.includes("comments") ? mockComments : mockAuthor);
        });
        (tokenApi.post as jest.Mock).mockResolvedValue({
            id: 3,
            text: 'new comment',
            postId: 1,
        });

        const store = createMockStore(mockUser);
        renderPostWithProviders(store);
    });

    it('shows spinner before data is loaded', () => {
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('loads author and comments', async () => {
        await waitFor(() => {
            expect(screen.getByTestId('avatar')).toBeInTheDocument();
            expect(screen.getByTestId('author-name')).toHaveTextContent('Diana Loyuk');
        });

        expect(tokenApi.get).toHaveBeenCalledWith('/posts/1/comments');
        expect(tokenApi.get).toHaveBeenCalledWith('/users/10');
    });

    it('shows post content', async () => {
        await waitFor(() => {
            expect(screen.getByTestId('post-img')).toHaveAttribute('src', '/post.png');
        });

        expect(screen.getByTestId('post-title')).toHaveTextContent('Test post');
        expect(screen.getByTestId('post-content')).toHaveTextContent('Some post content');
    });

    it('toggles comments visibility', async () => {
        await waitFor(() => { expect(screen.getByTestId('arrow-up')).toBeInTheDocument() });
        fireEvent.click(screen.getByTestId('arrow-up'));

        expect(screen.getByTestId('pencil')).toBeInTheDocument();
        expect(screen.getByText('Cool comment')).toBeInTheDocument();
        expect(screen.getByText('Bad comment')).toBeInTheDocument();
    });

    it('handles liking post', async () => {
        await waitFor(() => screen.getByTestId('like'));
        const likesText = screen.getByText('5 likes');
        fireEvent.click(screen.getByTestId('like').parentElement!);

        expect(tokenApi.post).toHaveBeenCalledWith('/like', { postId: 1 });

        await waitFor(() => { expect(likesText.textContent).toBe('6 likes') });
    });

    it('adds a new comment', async () => {
        await waitFor(() => fireEvent.click(screen.getByTestId('arrow-up')));
        const textarea = screen.getByTestId('comment-textarea');
        fireEvent.change(textarea, { target: { value: 'new comment' } });

        const button = screen.getByTestId('add-comment-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(tokenApi.post).toHaveBeenCalledWith('/comments', {
                postId: 1,
                text: 'new comment',
            });
        });
    });
});
