'use client';

import { useTranslation } from 'react-i18next';
import './style.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Unauthorized() {
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <div className="error-page">
      <Image
        className="error-image"
        src="/imgs/401error.png"
        width={150}
        height={150}
        alt="Image of error 401"
      />
      <h1>{t('oops')}<br />{t('smthWentWrong')}</h1>
      <button className="to-main" onClick={() => { router.push('/') }}>{t('mainLink')}</button>
    </div>
  );
}
