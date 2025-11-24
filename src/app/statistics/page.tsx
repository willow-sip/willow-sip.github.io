'use client';

import Statistics from '@/components/Statistics';
import WithMoonLoader from '@/components/WithMoonLoader';

const StatsWithLoader = WithMoonLoader(Statistics);

export default function StatsPage() {
    return <StatsWithLoader />;
}