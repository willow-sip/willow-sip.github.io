'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from '@/slices/authSlice';
import type { AppDispatch } from '@/store';

export function AuthProvider() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return null;
}