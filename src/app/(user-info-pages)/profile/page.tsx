'use client';

import { lazy } from 'react';
import WithMoonLoader from '@/components/WithMoonLoader';

const Profile = lazy(() => import('@/components/Profile'));
const ProfileWithLoader = WithMoonLoader(Profile);

export default function ProfilePage() {
    return <ProfileWithLoader />;
}

