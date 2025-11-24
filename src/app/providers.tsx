'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MockProvider } from '@/context/MockProvider'
import { useTheme } from '@/context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import i18n from '@/i18next';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { theme } = useTheme();

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
            <div className="app" data-theme={theme}>
              <Header />
              <AuthProvider />
              {children}
              <Footer />
            </div>
          </MockProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  );
}