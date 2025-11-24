import { Poppins } from 'next/font/google';
import { Providers } from './providers';
import { Metadata } from 'next';
import './globals.css';

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Social Media App',
    description: 'Social media application created with React and Next.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={poppins.className}>
            <body data-theme="dark">
                <Providers>
                    <div id="root">
                        <div id="notification-root" />
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}