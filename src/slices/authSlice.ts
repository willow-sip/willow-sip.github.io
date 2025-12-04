import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/data/datatypes';
import { getTokenExpiration } from '@/utils';

export interface AuthState {
  user: User | null;
  userAuth: boolean;
  authMode: string | null;
  expiresAt: number | null;
}

const initialState: AuthState = {
  user: null,
  userAuth: false,
  authMode: null,
  expiresAt: null,
};

export const signUp = createAsyncThunk(
  'auth/signup',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Signup failed');
    return true;
  }
);

export const signIn = createAsyncThunk(
  'auth/signin',
  async ({ email, password }: { email: string; password: string },
    { dispatch }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    const exp = getTokenExpiration(data.token);
    if (!exp) throw new Error('Invalid token');

    localStorage.setItem('currentUser', JSON.stringify(data.user));
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('expiresAt', exp.toString());

    dispatch(setAuth({ user: data.user, expiresAt: exp }));

    return true;
  }
);

export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { dispatch }) => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    const savedExp = localStorage.getItem('expiresAt');

    if (savedUser && savedToken && savedExp) {
      const exp = parseInt(savedExp, 10);
      if (Date.now() < exp) {
        const user: User = JSON.parse(savedUser);
        dispatch(setAuth({ user, expiresAt: exp }));
      } else {
        dispatch(clearAuth());
      }
    }
  }
);

export const logOut = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(clearAuth());
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User; expiresAt: number }>) {
      state.user = action.payload.user;
      state.userAuth = true;
      state.expiresAt = action.payload.expiresAt;
    },
    clearAuth(state) {
      state.user = null;
      state.userAuth = false;
      state.authMode = null;
      state.expiresAt = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('expiresAt');
      localStorage.removeItem('authToken');
    },
    updateAuthMode(state, action: PayloadAction<string | null>) {
      state.authMode = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
  },
});

export const { setAuth, clearAuth, updateAuthMode, updateUser } = authSlice.actions;
export default authSlice.reducer;



