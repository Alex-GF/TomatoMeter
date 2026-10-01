import { createContext, useEffect, useState } from 'react';
import { useSpaceClient } from 'space-react-client';
import { Contract, Pricing } from '../../types';
import { toSubscriptionArr } from '../../utils/contracts';
import { synchronizeSubscription } from '../../utils/subscriptionSynchronization';
import useAxios from '../../hooks/useAxios';

interface SubscriptionContextType {
  currentSubscription: string[];
  setCurrentSubscription: (newSubscription: string[]) => void;
  contract: Contract | null;
  pricing: Pricing | null;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [currentSubscription, setCurrentSubscription] = useState<string[]>(['basic']);
  const [contract, setContract] = useState<Contract | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const axiosInstance = useAxios();
  const spaceClient = useSpaceClient();

  useEffect(() => synchronizeSubscription({
    client: spaceClient,
    browserWindow: window,
    browserDocument: document,
    read: async () => (await axiosInstance.get<{ contract: Contract; pricing: Pricing }>('/contracts/subscription')).data,
    apply: snapshot => {
      setContract(snapshot.contract);
      setPricing(snapshot.pricing);
      setCurrentSubscription(toSubscriptionArr(
        snapshot.contract.subscriptionPlans.tomatometer,
        snapshot.contract.subscriptionAddOns.tomatometer,
      ));
    },
    onError: error => console.error('Unable to refresh subscription from SPACE:', error),
  }), [axiosInstance, spaceClient]);

  return (
    <SubscriptionContext.Provider value={{ currentSubscription, setCurrentSubscription, contract, pricing }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
