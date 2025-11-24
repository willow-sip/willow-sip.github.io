'use client';

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnwrappedSidebar as Sidebar } from './index';
import { User, Group } from '@/data/datatypes';
import { TFunction } from 'i18next';
import { tokenApi } from '@/tokenApi';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock('@/tokenApi', () => ({
    tokenApi: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockT = Object.assign(
    (key: string) => key,
    { $TFunctionBrand: undefined }
) as TFunction;

const mockUser: User = {
    id: 0,
    username: 'admin',
    email: 'admin@mail.ru',
    password: '12345',
};

const mockSuggestedUsers: User[] = [
    {
        id: 1,
        username: 'test',
        firstName: 'Test',
        secondName: 'User',
        profileImage: '/some/img/path.png',
    },
    {
        id: 2,
        username: 'user',
        firstName: 'Diana',
        secondName: 'Loyuk',
        profileImage: '/some/img/path.png',
    }
];

const mockGroups: Group[] = [
    {
        id: 1,
        title: 'Next.js lovers',
        membersCount: 1000,
        photo: '/other/img/path.png',
    },
];

describe('tests for Sidebar component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (tokenApi.post as jest.Mock).mockResolvedValue({data: {allGroups: mockGroups}});
        (tokenApi.get as jest.Mock).mockReturnValue(mockSuggestedUsers);
    });

    const renderSidebar = () =>
        render(<Sidebar user={mockUser} userAuth={true} t={mockT}/>);

    it('shows loaders for both sections', () => {
        renderSidebar();
        expect(screen.getByTestId('load-sug-people')).toBeInTheDocument();
        expect(screen.getByTestId('load-sug-groups')).toBeInTheDocument();
    });

    it('fetches and shows suggested users and groups after loaders', async () => {
        renderSidebar();

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('Diana Loyuk')).toBeInTheDocument();
            expect(screen.getByText('Next.js lovers')).toBeInTheDocument();
        });

        expect(screen.getAllByTestId('Person avatar')).toHaveLength(2);
        expect(screen.getByTestId('Community avatar')).toHaveAttribute('src', expect.stringContaining('%2Fother%2Fimg%2Fpath.png'));

        expect(tokenApi.post).toHaveBeenCalledWith('/graphql', expect.objectContaining({
            query: expect.stringContaining('allGroups'),
        }));
        expect(tokenApi.get).toHaveBeenCalledWith('/getSuggested');
    });
});