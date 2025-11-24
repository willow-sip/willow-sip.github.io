import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPost from '../AddPost';

jest.mock('../AddPostForm', () => ({
  __esModule: true,
  default: (props: {postCreated: () => void}) => (
    <div data-testid="add-post-form">
      <button onClick={props.postCreated}>Submit</button>
    </div>
  ),
}));

describe('tests for AddPost component', () => {
  it('correctly renders children', () => {
    render(<AddPost avatar="/test-avatar.png" postCreated={jest.fn()} />);
    
    expect(screen.getByTestId('user-avatar')).toHaveAttribute('src', expect.stringContaining('test-avatar.png'));
    expect(screen.getByTestId('whats-happening')).toBeInTheDocument();
    expect(screen.getByTestId('tell-everyone')).toBeInTheDocument();
  });

  it('shows AddPostForm when button is clicked', async () => {
    render(<AddPost postCreated={jest.fn()} />);

    fireEvent.click(screen.getByTestId('tell-everyone'));
    await waitFor(() => {
      expect(screen.getByTestId('add-post-form')).toBeInTheDocument();
    });
  });
});