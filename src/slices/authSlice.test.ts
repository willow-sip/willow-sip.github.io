import { configureStore } from '@reduxjs/toolkit';
import authSlice, {
  setAuth,
  clearAuth,
  updateAuthMode,
  updateUser,
  signUp,
  signIn,
  logOut,
  restoreAuth,
  AuthState
} from '@/slices/authSlice';
import { User } from '@/data/datatypes';
import { localStorageMock } from '@/tests/basic_mocks/localStorageMock';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser: User = {
  id: 0,
  username: 'admin',
  email: 'admin@mail.ru',
  password: '12345',
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNjk4NzY1NDMyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
const createStore = (state: Partial<AuthState> = {}) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        user: null,
        userAuth: false,
        authMode: null,
        expiresAt: null,
        ...state,
      },
    },
  });
};

describe('async thunks of authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });
  
  it('successful sign-up', async () => {
    mockFetch.mockResolvedValue({ok: true, status: 200});
    const store = createStore();
    await store.dispatch(signUp({ email: 'user@mail.ru', password: '1234' }));
    expect(fetch).toHaveBeenCalledWith('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@mail.ru', password: '1234' }),
    });

    const state = store.getState().auth;
    expect(state.authMode).toBeNull();
  });

  it('error while sign-up', async() => {
    mockFetch.mockResolvedValue({ok: false, status: 401});
    const store = createStore();
    const response = await store.dispatch(signUp({email: 'user@mail.ru', password: '1234' }));
    expect((response as any).error.message).toBe('Signup failed');
  });

  it('successful sign-in', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    const store = createStore();
    await store.dispatch(signIn({ email: 'user@mail.ru', password: '1234' }));
    expect(fetch).toHaveBeenCalledWith('/api/login', expect.any(Object));

    expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('expiresAt', expect.any(String));

    const state = store.getState().auth;
    expect(state.user).toEqual(mockUser);
    expect(state.userAuth).toBe(true);
    expect(state.authMode).toBeNull();
  });

  it('sign-in with expired/incorrect token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'some.mock.token', user: mockUser }),
    });

    const store = createStore();
    const response = await store.dispatch(signIn({ email: 'user@mail.ru', password: '1234' }));
    expect((response as any).error.message).toContain('Unexpected token');
  });

  it('error while sign-in', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 401});
    const store = createStore();
    const response = await store.dispatch(signIn({email: 'user@mail.ru', password: '1234' }));
    expect((response as any).error.message).toBe('Login failed');
  });

  it('successful log-out', async () => {
    const store = createStore({ user: mockUser, userAuth: true });
    await store.dispatch(logOut());

    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('expiresAt');

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.userAuth).toBe(false);
    expect(state.authMode).toBeNull();
  });
});

describe('restoreAuth thunk', () => {
  const expireTime = Date.now() + 3600000;

  it('if token is not expired, restores auth data', async () => {
    localStorageMock.setItem('currentUser', JSON.stringify(mockUser));
    localStorageMock.setItem('authToken', mockToken);
    localStorageMock.setItem('expiresAt', expireTime.toString());

    const store = createStore();
    await store.dispatch(restoreAuth());

    const state = store.getState().auth;
    expect(state.user).toEqual(mockUser);
    expect(state.userAuth).toBe(true);
    expect(state.expiresAt).toBe(expireTime);
  });

  it('if token is expired deletes auth data', async () => {
    const expiredTime = Date.now() - 1000;
    localStorageMock.setItem('currentUser', JSON.stringify(mockUser));
    localStorageMock.setItem('authToken', mockToken);
    localStorageMock.setItem('expiresAt', expiredTime.toString());

    const store = createStore();
    await store.dispatch(restoreAuth());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.userAuth).toBe(false);
    expect(state.expiresAt).toBeNull();

    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('expiresAt');
  });
});

describe('reducers of authSlice', () => {
  it('sets Auth data and state', () => {
    const store = createStore();
    store.dispatch(setAuth({ user: mockUser, expiresAt: Date.now() + 3600000 }));
    const currentState = store.getState().auth;
    expect(currentState.user).toEqual(mockUser);
    expect(currentState.userAuth).toBe(true);
  });

  it('clears all Auth data', () => {
    const store = createStore({ user: mockUser, userAuth: true });
    store.dispatch(clearAuth());
    const currentState = store.getState().auth;
    expect(currentState.user).toBeNull();
    expect(currentState.userAuth).toBe(false);
    expect(currentState.authMode).toBeNull();
  });

  it('updates Auth data and state', () => {
    const store = createStore();
    store.dispatch(updateAuthMode('signup'));
    const currentState = store.getState().auth;
    expect(currentState.authMode).toBe('signup');
  });

  it('updates user data ad state', () => {
    const store = createStore({ user: mockUser, userAuth: true });
    const updates = { email: 'new-email@mail.ru' };
    store.dispatch(updateUser(updates));
    const user = store.getState().auth.user!;
    expect(user.email).toBe('new-email@mail.ru');
  });
});