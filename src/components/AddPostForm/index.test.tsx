import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddPostForm from './index';
import { showNotification } from '@/components/notify';
import { tokenApi } from '@/tokenApi';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/components/notify', () => ({
  showNotification: jest.fn(),
}));

jest.mock('@/tokenApi', () => ({
  tokenApi: {
    post: jest.fn(),
  },
}));

jest.mock('@/svgs', () => ({
  Envelope: () => <svg data-testid="envelope-icon" />,
  Pencil: () => <svg data-testid="pencil-icon" />,
  UploadFile: () => <svg data-testid="upload-icon" />,
}));

const createStore = () =>
  configureStore({
    reducer: {},
    preloadedState: {},
  });

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithProviders = (children: React.ReactElement) => {
  return render(
    <Provider store={createStore()}>
      <QueryClientProvider client={createQueryClient()}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
};

describe('AddPostForm', () => {
  const mockClose = jest.fn();
  const mockPostCreated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (showNotification as jest.Mock).mockClear();
    (tokenApi.post as jest.Mock).mockClear();
  });

  it('renders form with correct inputs', () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    expect(screen.getByTestId('post-title')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('create-post-btn')).toBeInTheDocument();
    expect(screen.getByTestId('close-form-btn')).toBeInTheDocument();
  });

  it('closes form when close button is clicked', () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    fireEvent.click(screen.getByTestId('close-form-btn'));
    expect(mockClose).toHaveBeenCalled();
  });

  it('shows notifications for empty fields', async () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    fireEvent.click(screen.getByTestId('create-post-btn'));
    
    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('inputPostTitle', 'error', 3000);
      expect(showNotification).toHaveBeenCalledWith('inputPostDesc', 'error', 3000);
    });
  });

  it('submits form correctly', async () => {
    (tokenApi.post as jest.Mock).mockResolvedValueOnce({ success: true });
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    fireEvent.change(screen.getByTestId('post-title'), {target: { value: 'Test post title' }});
    fireEvent.change(screen.getByTestId('description'), {target: { value: 'Test post description' }});
    fireEvent.click(screen.getByTestId('create-post-btn'));
    
    await waitFor(() => {
      expect(tokenApi.post).toHaveBeenCalledWith('/posts', {
        title: 'Test post title',
        content: 'Test post description'
      });

      expect(showNotification).toHaveBeenCalledWith('postCreated', 'success', 3000);
      expect(mockPostCreated).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('shows notification when form didnt submit', async () => {
    (tokenApi.post as jest.Mock).mockRejectedValueOnce(new Error('Failed'));

    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    fireEvent.change(screen.getByTestId('post-title'), {target: { value: 'Test post title' }});
    fireEvent.change(screen.getByTestId('description'), {target: { value: 'Test post description' }});
    fireEvent.click(screen.getByTestId('create-post-btn'));
    
    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('postNotCreated', 'error', 3000);
      expect(mockPostCreated).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  it('handles file upload', () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['theres an image i swear'], 'picture.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('Uploaded file: picture.jpg.')).toBeInTheDocument();
  });

  it('shows notification for file with size > 10MB', () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['666'.repeat(11*1024*1024)], 'huge.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(showNotification).toHaveBeenCalledWith('fileSizeExceeded', 'error', 3000);
  });

  it('shows notification for invalid file type', () => {
    renderWithProviders(<AddPostForm close={mockClose} postCreated={mockPostCreated} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['not image...'], 'text.txt', { type: 'application/txt' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(showNotification).toHaveBeenCalledWith('invalidFileType', 'error', 3000);
  });
});