import { lazy } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WithMoonLoader from './WithMoonLoader';

const LazyComponent = lazy(() => Promise.resolve({
  default: () => <div>Lazy Loaded!</div>
}));

const WrappedLazy = WithMoonLoader(LazyComponent);

describe('tests for WithMoonLoader HOC', () => {
  it('renders circular progress from MUI during suspence', async () => {
    render(<WrappedLazy />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Lazy Loaded!')).toBeInTheDocument();
    });
});

  it('renders wrapped component after suspense', async () => {
    const TestComponent = () => <div>Loaded!</div>;
    const WrappedComponent = WithMoonLoader(TestComponent);

    render(<WrappedComponent />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Loaded!')).toBeInTheDocument();
  });
});
