import { store } from '@/store';
import { clearAuth } from '@/slices/authSlice';

const getStoredToken = (): string | null => {
  const exp = localStorage.getItem('expiresAt');
  if (!exp || Date.now() >= parseInt(exp, 10)) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiresAt');
    store.dispatch(clearAuth());
    return null;
  }
  return localStorage.getItem('authToken');
};

export const tokenApi = {
  async get(endpoint: string) {
    const token = getStoredToken();
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('expiresAt');
      store.dispatch(clearAuth());
      throw new Error('Unauthorized');
    }

    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },

  async post(endpoint: string, body: unknown) {
    const token = getStoredToken();
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('expiresAt');
      store.dispatch(clearAuth());
      throw new Error('Unauthorized');
    }

    if (!res.ok) throw new Error(`POST ${endpoint} failed`);
    return res.json();
  },

  async put(endpoint: string, body: unknown) {
    const token = getStoredToken();
    const res = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('expiresAt');
      store.dispatch(clearAuth());
      throw new Error('Unauthorized');
    }

    if (!res.ok) throw new Error(`PUT ${endpoint} failed`);
    return res.json();
  },

  async delete(endpoint: string) {
    const token = getStoredToken();
    const res = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (res.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('expiresAt');
      store.dispatch(clearAuth());
      throw new Error('Unauthorized');
    }

    if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);
    return res.json();
  }

};