'use client';

import WithMoonLoader from '@/components/WithMoonLoader';
import AuthPage from '@/components/AuthPage';

const AuthPageWithLoader = WithMoonLoader(AuthPage);

export default function SignInPage() {
  return <AuthPageWithLoader mode="signup" />
}
