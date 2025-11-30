'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MockProvider } from '@/context/MockProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import i18n from '@/i18next';
import { AuthProvider } from '@/context/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const updateHtmlLang = () => {
      document.documentElement.lang = i18n.language;
    };
    updateHtmlLang();
    i18n.on('languageChanged', updateHtmlLang);

    return () => {
      i18n.off('languageChanged', updateHtmlLang);
    };
  }, []);


  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <MockProvider>
            <AuthProvider />
            {children}
          </MockProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  );
}