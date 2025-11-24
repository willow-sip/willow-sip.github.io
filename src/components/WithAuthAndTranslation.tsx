'use client';

import React from 'react';
import { RootState } from '@/store';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface AuthProps {
    user: RootState['auth']['user'];
    userAuth: RootState['auth']['userAuth'];
    t: TFunction;
}

const enableAuth = <T extends object>(Component: React.ComponentType<T & AuthProps>) => {
    return ((props: T) => {
        const { t } = useTranslation();
        const { user, userAuth } = useSelector((state: RootState) => state.auth);
        return <Component {...props} t={t} user={user} userAuth={userAuth} />;
    });
};

export default enableAuth;