'use client';

import WithMoonLoader from '@/components/WithMoonLoader';
import React from 'react';

const Statistics = React.lazy(() => import('@/components/Statistics'));
const StatsWithLoader = WithMoonLoader(Statistics);

export default function StatsPage() {
    return <StatsWithLoader />;
}