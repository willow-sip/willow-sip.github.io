'use client';

import { useTranslation } from 'react-i18next';
import './style.css';
import Image from 'next/image';

export default function Unauthorized() {
  const { t } = useTranslation();
  
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
    </div>
  );
}
