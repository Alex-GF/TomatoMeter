import { createContext, useEffect, useState } from 'react';
import { toSubscriptionArr } from '../../utils/contracts';
import useAxios from '../../hooks/useAxios';

interface SubscriptionContextType {
  currentSubscription: string[];
  setCurrentSubscription: (newSubscription: string[]) => void;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>({
  currentSubscription: ['basic'],
  setCurrentSubscription: () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [currentSubscription, setCurrentSubscription] = useState<string[]>(['basic']);
  const axiosInstance = useAxios();
  useEffect(() => {
    axiosInstance.get('/contracts/test-user-id').then(response => {
      const subscriptionPlan = response.data.contract.subscriptionPlans.tomatometer;
      const subscriptionAddons = response.data.contract.subscriptionAddOns.tomatometer;

      setCurrentSubscription(toSubscriptionArr(subscriptionPlan, subscriptionAddons));
    });
  }, []);

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
