import { render, screen } from '@testing-library/react';
import ChartStats from './index';
import { StatsData } from '../Statistics';

jest.mock('recharts', () => {
  const original = jest.requireActual('recharts');
  return {
    ...original,
    Line: () => <div data-testid="recharts-line" />,
    Bar: () => <div data-testid="recharts-bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    };
});

const mockStats: StatsData = {
  likes: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 190 },
  ],
  comments: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 60 },
  ],
};

describe('tests for ChartStats component', () => {
  it('renders charts for likes and comments statistics', () => {
    render(<ChartStats stats={mockStats} />);

    expect(screen.getByTestId('recharts-line')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar')).toBeInTheDocument();

    expect(screen.getAllByTestId('x-axis')).toHaveLength(2);
    expect(screen.getAllByTestId('y-axis')).toHaveLength(2);

    expect(screen.getAllByTestId('cartesian-grid')).toHaveLength(2);
    expect(screen.getAllByTestId('tooltip')).toHaveLength(2);
  });
});