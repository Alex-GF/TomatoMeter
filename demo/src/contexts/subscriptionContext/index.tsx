import { createContext, useState } from "react";

interface SubscriptionContextType {
    currentSubscription: string[];
    setCurrentSubscription: (newSubscription: string[]) => void;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>({
    currentSubscription: ["FREE"],
    setCurrentSubscription: () => {},
});

export function SubscriptionProvider({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const [currentSubscription, setCurrentSubscription] = useState<string[]>(["FREE"]);

    return (
        <SubscriptionContext.Provider
            value={{
                currentSubscription,
                setCurrentSubscription,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}