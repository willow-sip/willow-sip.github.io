import { tokenApi } from '@/tokenApi';
import { store } from '@/store';
import { clearAuth } from '@/slices/authSlice';
import {localStorageMock, localStorageSpies} from '@/tests/basic_mocks/localStorageMock';

jest.mock('@/store', () => ({
  store: { dispatch: jest.fn() }
}));

jest.mock('@/slices/authSlice', () => ({
  clearAuth: jest.fn(() => ({ type: 'auth/clearAuth' })),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const expectCleaningLocalStorage = () => {
  expect(localStorageSpies.removeItem).toHaveBeenCalledWith('currentUser');
  expect(localStorageSpies.removeItem).toHaveBeenCalledWith('authToken');
  expect(localStorageSpies.removeItem).toHaveBeenCalledWith('expiresAt');
  expect(store.dispatch).toHaveBeenCalledWith(clearAuth());
};

describe('general tests for tokenApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('token expiration logic', () => {
    it('clears storage if token is expired', async () => {
      localStorageMock.setItem('currentUser', JSON.stringify({ id: 0 }));
      localStorageMock.setItem('authToken', 'expired');
      localStorageMock.setItem('expiresAt', (Date.now() - 1000).toString());

      await expect(tokenApi.get('/qwerty')).rejects.toThrow();
      expectCleaningLocalStorage();
    });

    it('puts token in headers of request if not expired', async () => {
      localStorageMock.setItem('authToken', 'some-token');
      localStorageMock.setItem('expiresAt', (Date.now() + 100000).toString());

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await tokenApi.get('/qwerty');

      expect(mockFetch).toHaveBeenCalledWith('/api/qwerty', {
        headers: { Authorization: 'Bearer some-token' },
      });
    });
  });

  describe('GET', () => {
    it('GET-request with header successful', async () => {
      localStorageMock.setItem('authToken', 'some-token');
      localStorageMock.setItem('expiresAt', (Date.now() + 100000).toString());

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'data' }),
      });

      const res = await tokenApi.get('/qwerty');

      expect(res).toEqual({ data: 'data' });
      expect(mockFetch).toHaveBeenCalledWith('/api/qwerty', {
        headers: { Authorization: 'Bearer some-token' },
      });
    });

    it('GET-request throws 401 error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      await expect(tokenApi.get('/qwerty')).rejects.toThrow('Unauthorized');
      expectCleaningLocalStorage();
    });
  });

  describe('POST', () => {
    it('POST-request with header and body successful', async () => {
      localStorageMock.setItem('authToken', 'some-token');
      localStorageMock.setItem('expiresAt', (Date.now() + 100000).toString());

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const res = await tokenApi.post('/qwerty', { data: 0 });

      expect(res).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith('/api/qwerty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer some-token',
        },
        body: JSON.stringify({ data: 0 }),
      });
    });

    it('POST-request throws 401 error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      await expect(tokenApi.post('/qwerty', { data: 0 })).rejects.toThrow('Unauthorized');
      expectCleaningLocalStorage();
    });
  });

  describe('PUT', () => {
    it('PUT-request with header and body successful', async () => {
      localStorageMock.setItem('authToken', 'some-token');
      localStorageMock.setItem('expiresAt', (Date.now() + 100000).toString());

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const res = await tokenApi.put('/qwerty', { data: 0 });

      expect(res).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith('/api/qwerty', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer some-token',
        },
        body: JSON.stringify({ data: 0 }),
      });
    });

    it('PUT-request throws 401 error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      await expect(tokenApi.put('/qwerty', { data: 0 })).rejects.toThrow('Unauthorized');
      expectCleaningLocalStorage();
    });
  });

  describe('DELETE', () => {

    it('DELETE-request with header successful', async () => {
      localStorageMock.setItem('authToken', 'some-token');
      localStorageMock.setItem('expiresAt', (Date.now() + 100000).toString());

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const res = await tokenApi.delete('/qwerty');

      expect(res).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith('/api/qwerty', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer some-token' },
      });
    });

    it('DELETE-request throws 401 error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      await expect(tokenApi.delete('/qwerty')).rejects.toThrow('Unauthorized');
      expectCleaningLocalStorage();
    });
  });
});