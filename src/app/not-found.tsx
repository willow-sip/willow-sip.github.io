'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import './401/style.css';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="error-page">
      <Image
        className="error-image"
        src={"/imgs/404error.png"}
        width={150}
        height={150}
        alt="Image of error 404"
      />
      <h1>{t('notFound')}</h1>
    </div>
  );
}
