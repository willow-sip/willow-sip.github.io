import { create } from 'zustand'

type ThemeState = {
    theme: string;
    updateTheme: (newTheme: string) => void;
    toggleTheme: () => void;
}

const getInitialTheme = (): string => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
};


export const useTheme = create<ThemeState>()((set, get) => {
    const initialTheme = getInitialTheme();
    if (typeof window !== 'undefined') {
        document.body.setAttribute('data-theme', initialTheme);
    }

    return {
        theme: initialTheme,

        updateTheme: (newTheme: string) => {
            set({ theme: newTheme });
            if (typeof window !== 'undefined') {
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            }
        },

        toggleTheme: () => {
            const current = get().theme;
            const next = current === 'light' ? 'dark' : 'light';
            get().updateTheme(next);
        },
    };
});
