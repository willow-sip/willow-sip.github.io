import { PropsWithChildren, useEffect, useState } from 'react';

export const MockProvider = ({ children }: PropsWithChildren) => {
    const [mockingEnabled, enableMocking] = useState(false);

    useEffect(() => {
        const enableApiMocking = async () => {
            const shouldEnableMocking = typeof window !== 'undefined';

            if (shouldEnableMocking) {
                const { startMockingSocial } = await import('@sidekick-monorepo/internship-backend');
                await startMockingSocial();

                enableMocking(true);
            }
        };

        enableApiMocking();
    }, []);

    if (!mockingEnabled) {
        return null;
    }

    return <>{children}</>;
};