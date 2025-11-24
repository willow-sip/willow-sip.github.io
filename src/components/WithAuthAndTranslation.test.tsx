import { render, screen } from '@testing-library/react';
import enableAuth from './WithAuthAndTranslation';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { TFunction } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { RootState } from '@/store';
import { User } from '@/data/datatypes';

interface AuthProps {
    user: RootState['auth']['user'];
    userAuth: RootState['auth']['userAuth'];
    t: TFunction;
}

const TestComponent = ({ user, userAuth, t }: AuthProps) => (
    <div>
        <div>{t('test')}</div>
        <div>{user?.username}</div>
        <div>{userAuth && "Authorized"}</div>
    </div>
);

const createStore = (user: User | null, userAuth: boolean) =>
    configureStore({
        reducer: {
            auth: () => ({
                user,
                userAuth,
                authMode: null,
                expiresAt: null,
            }),
        },
    });

describe('pass auth data and translation function to class components', () => {
    beforeAll(() => {
        i18n.use(initReactI18next).init({
            lng: 'en',
            fallbackLng: 'en',
            resources: {
                en: {
                    translation: {
                        test: 'Test',
                    },
                },
                ru: {
                    translation: {
                        test: 'Тест',
                    },
                },
            },
            interpolation: { escapeValue: false },
        });
    });

    it('renders translated text in English', () => {
        const store = createStore({ id: 0, username: 'admin' }, true);
        const Wrapped = enableAuth(TestComponent);

        render(
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <Wrapped />
                </I18nextProvider>
            </Provider>
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('Authorized')).toBeInTheDocument();
    });

    it('renders translated text in russian', async () => {
        await i18n.changeLanguage('ru');
        const store = createStore({ id: 0, username: 'админ' }, false);
        const Wrapped = enableAuth(TestComponent);

        render(
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <Wrapped />
                </I18nextProvider>
            </Provider>
        );

        expect(screen.getByText('Тест')).toBeInTheDocument();
        expect(screen.getByText('админ')).toBeInTheDocument();
        expect(screen.queryByText('Authorized')).not.toBeInTheDocument();
    });
});
