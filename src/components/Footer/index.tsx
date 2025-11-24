'use client';

import { useTheme } from '@/context/ThemeContext';
import './style.css';

const Footer = () => {
    const { theme } = useTheme();

    return (
        <footer className="footer" data-theme={theme}>
            <p>© 2024 sidekick</p>
        </footer>
    );
};

export default Footer;
