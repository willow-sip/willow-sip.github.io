import { render, screen } from '@testing-library/react';
import TableStats from './index';
import { StatsData } from '../Statistics';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

const mockStats: StatsData = {
  likes: [
    { month: 'Jan', count: 10 },
    { month: 'Feb', count: 15 },
  ],
  comments: [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 8 },
  ],
};

describe('tests for TableStats component', () => {
  it('renders tables for likes and comments statistics', () => {
    render(<TableStats stats={mockStats} />);

    expect(screen.getByTestId('likes-stat-header')).toBeInTheDocument();
    expect(screen.getByTestId('comments-stat-header')).toBeInTheDocument();

    expect(screen.getAllByTestId('month')).toHaveLength(4);
    expect(screen.getAllByTestId('likes-count')).toHaveLength(2);
    expect(screen.getAllByTestId('comments-count')).toHaveLength(2);

    expect(screen.getAllByText('Jan')).toHaveLength(2);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText('Feb')).toHaveLength(2);
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});