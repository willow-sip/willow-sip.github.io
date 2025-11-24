'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

import './style.css'

const LangToggler = () => {
    const { i18n } = useTranslation();
    const { theme } = useTheme();

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <div className="lang-toggler" data-theme={theme}>
            <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : ''}
            >EN</button>
            <span> | </span>
            <button
                onClick={() => changeLanguage('ru')}
                className={i18n.language === 'ru' ? 'active' : ''}
            >RU</button>
        </div>
    );
};

export default LangToggler;