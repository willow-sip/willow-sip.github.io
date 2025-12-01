'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import './style.css';

export default function UserInfoLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="user-info-pages">
            <div className="page-switch">
                <button
                    data-testid="profile"
                    className={pathname === '/profile' ? 'active' : ''}
                    onClick={() => router.push('/profile')}
                >
                    {t('profileLink')}
                </button>

                <button
                    data-testid="statistics"
                    className={pathname === '/statistics' ? 'active' : ''}
                    onClick={() => router.push('/statistics')}
                >
                    {t('statsLink')}
                </button>
            </div>

            {children}
        </div>
    );
}
