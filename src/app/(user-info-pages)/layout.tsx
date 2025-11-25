'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import './style.css'

export default function UserInfoLayout({children}: {children: React.ReactNode}) {
    
    const [location, setLocation] = useState<"profile" | "statistics">("profile");
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="user-info-pages">
            <div className="page-switch">
                <button data-testid="profile" className={location === "profile" ? "active" : ""} onClick={() => { router.push('/profile'); setLocation("profile") }}>{t('profileLink')}</button>
                <button data-testid="statistics" className={location === "statistics" ? "active" : ""} onClick={() => { router.push('/statistics'); setLocation("statistics") }}>{t('statsLink')}</button>
            </div>
            {children}
        </div>
    );
}