import { showNotification } from '@/components/notify';
import { createRoot } from 'react-dom/client';

jest.mock('@/components/Notification', () => jest.fn(() => null));

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(),
}));

describe('general tests for showNotification', () => {
  let rootRender: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `<div id="notification-root"></div>`;
    rootRender = jest.fn();
    (createRoot as jest.Mock).mockReturnValue({ render: rootRender });
  });

  afterEach(() => jest.clearAllMocks());

  it('renders notification with correct props data', () => {
    showNotification('Something done', 'success', 3000);

    expect(createRoot).toHaveBeenCalled();
    expect(rootRender).toHaveBeenCalledTimes(1);

    const notification = rootRender.mock.calls[0][0].props.children[0];
    
    expect(notification.props).toMatchObject({
      message: 'Something done',
      type: 'success',
      autoHide: 3000,
      isVisible: true,
    });
  });

  it('close function removes notification', () => {
    const close = showNotification('Something done', 'success', 3000);
    close();
    expect(!rootRender.mock.calls);
  });
});