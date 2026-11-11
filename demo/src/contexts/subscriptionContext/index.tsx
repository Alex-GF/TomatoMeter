import { createContext, useCallback, useEffect, useState } from 'react';
import { useSpaceClient } from 'space-react-client';
import { Contract, Pricing } from '../../types';
import { toSubscriptionArr } from '../../utils/contracts';
import { synchronizeSubscription } from '../../utils/subscriptionSynchronization';
import useAxios from '../../hooks/useAxios';

interface SubscriptionSnapshot {
  contract: Contract;
  pricing: Pricing;
  pricingYaml: string;
}

interface SubscriptionContextType {
  currentSubscription: string[];
  setCurrentSubscription: (newSubscription: string[]) => void;
  contract: Contract | null;
  pricing: Pricing | null;
  /** The Pricing2Yaml file behind `pricing`, as SPACE stores it. The Pricing page renders it. */
  pricingYaml: string | null;
  /** Re-reads the subscription, so a plan change shows everywhere at once. */
  refresh: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [currentSubscription, setCurrentSubscription] = useState<string[]>(['basic']);
  const [contract, setContract] = useState<Contract | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingYaml, setPricingYaml] = useState<string | null>(null);
  const axiosInstance = useAxios();
  const spaceClient = useSpaceClient();

  const read = useCallback(
    async () => (await axiosInstance.get<SubscriptionSnapshot>('/contracts/subscription')).data,
    [axiosInstance]
  );

  const apply = useCallback((snapshot: SubscriptionSnapshot) => {
    setContract(snapshot.contract);
    setPricing(snapshot.pricing);
    setPricingYaml(snapshot.pricingYaml);
    setCurrentSubscription(toSubscriptionArr(
      snapshot.contract.subscriptionPlans.tomatometer,
      snapshot.contract.subscriptionAddOns.tomatometer,
    ));
  }, []);

  const refresh = useCallback(async () => apply(await read()), [apply, read]);

  useEffect(() => synchronizeSubscription({
    client: spaceClient,
    browserWindow: window,
    browserDocument: document,
    read,
    apply,
    onError: error => console.error('Unable to refresh subscription from SPACE:', error),
  }), [spaceClient, read, apply]);

  return (
    <SubscriptionContext.Provider value={{ currentSubscription, setCurrentSubscription, contract, pricing, pricingYaml, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
