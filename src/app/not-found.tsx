'use client';

import './401/style.css';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="error-page">
      <Image
        className="error-image"
        src="/imgs/404error.png"
        width={150}
        height={150}
        alt="Image of error 404"
      />
      <h1>{t('notFound')}</h1>
      <button className="to-main" onClick={() => { router.push('/') }}>{t('mainLink')}</button>
    </div>
  );
}
