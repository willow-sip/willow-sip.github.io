import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Statistics, { StatsData } from './index';
import { tokenApi } from '@/tokenApi';
import { Like, Comment } from '@/data/datatypes';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock('@/tokenApi', () => ({
  tokenApi: {
    get: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock('../TableStats', () => ({
  __esModule: true,
  default: ({ stats }: { stats: StatsData }) => (
    <div data-testid="table-stats">
      <span>Table: Likes={stats.likes.length}, Comments={stats.comments.length}</span>
    </div>
  ),
}));

jest.mock('../ChartStats', () => ({
  __esModule: true,
  default: ({ stats }: { stats: StatsData }) => (
    <div data-testid="chart-stats">
      <span>Chart: Likes={stats.likes.length}, Comments={stats.comments.length}</span>
    </div>
  ),
}));

const mockLikes: Partial<Like>[] = [
  { id: 1, postId: 1, creationDate: '2025-01-15T10:00:00Z' },
  { id: 2, postId: 2, creationDate: '2025-01-20T11:00:00Z' },
  { id: 3, postId: 3, creationDate: '2025-02-05T09:00:00Z' },
];

const mockComments: Partial<Comment>[] = [
  { id: 1, postId: 1, text: 'Hi', creationDate: '2025-01-10T08:00:00Z' },
  { id: 2, postId: 2, text: 'Hello', creationDate: '2025-03-01T14:00:00Z' },
];

describe('tests for Statistics component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenApi.get as jest.Mock)
      .mockReturnValueOnce(mockLikes)
      .mockReturnValueOnce(mockComments);
  });

  it('shows statistics and loads data', async () => {
    render(<Statistics />);
    await waitFor(() => { expect(screen.getByTestId('table-stats')).toBeInTheDocument() });

    expect(tokenApi.get).toHaveBeenCalledTimes(2);
    expect(tokenApi.get).toHaveBeenCalledWith('/me/likes');
    expect(tokenApi.get).toHaveBeenCalledWith('/me/comments');
  });

  it('toggles between table and chart view of statistics', async () => {
    render(<Statistics />);
    await waitFor(() => { expect(screen.getByTestId('table-stats')).toBeInTheDocument() });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    await act(async () => { checkbox.click() });
    await waitFor(() => { expect(screen.getByTestId('chart-stats')).toBeInTheDocument() });

    expect(screen.queryByTestId('table-stats')).not.toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Statistics />);

    expect(screen.getByTestId('profile-link')).toBeInTheDocument();
    expect(screen.getByTestId('statistics-link')).toBeInTheDocument();

    const profileBtn = screen.getByTestId('profile-link');
    const statsBtn = screen.getByTestId('statistics-link');

    expect(statsBtn).toHaveClass('active');
    expect(profileBtn).not.toHaveClass('active');
  });
});