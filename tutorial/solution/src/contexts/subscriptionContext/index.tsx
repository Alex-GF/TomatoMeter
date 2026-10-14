import { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSpaceClient } from 'space-react-client';
import { Contract, Pricing } from '../../types';
import { toSubscriptionArr } from '../../utils/contracts';
import useAxios from '../../hooks/useAxios';
import { USER_ID } from '../../constants/user';

/**
 * - loading: first read in progress
 * - disconnected: the backend is not connected to SPACE (TODO B1, or missing API key)
 * - pending: connected, but the TomatoMeter service or the user's contract does not exist yet
 * - ready: contract and pricing loaded
 */
export type SubscriptionStatus = 'loading' | 'disconnected' | 'pending' | 'ready';

export interface SubscriptionContextType {
  status: SubscriptionStatus;
  currentSubscription: string[];
  setCurrentSubscription: (newSubscription: string[]) => void;
  contract: Contract | null;
  pricing: Pricing | null;
  /** Re-reads the user's subscription. Called on focus, after every pomodoro and after plan changes. */
  refresh: () => Promise<void>;
  updateSubscription: (plan: string, addOns: Record<string, number>) => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const RETRY_MS = 5000;

export function SubscriptionProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [currentSubscription, setCurrentSubscription] = useState<string[]>(['basic']);
  const [contract, setContract] = useState<Contract | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const axiosInstance = useAxios();

  // F2 · Load the user's pricing token (part 1 of 2)
  const spaceClient = useSpaceClient();

  const refresh = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<{ contract: Contract; pricing: Pricing }>('/subscription');
      setContract(data.contract);
      setPricing(data.pricing);
      setCurrentSubscription(
        toSubscriptionArr(
          data.contract.subscriptionPlans.tomatometer,
          data.contract.subscriptionAddOns.tomatometer
        )
      );
      setStatus('ready');

      // F2 · Load the user's pricing token (part 2 of 2)
      await spaceClient.setUserId(USER_ID);
    } catch (error) {
      const code = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (code === 503) setStatus('disconnected');
      else if (code === 404) setStatus('pending');
      else console.error('Unable to refresh the subscription:', error);
    }
  }, [axiosInstance, spaceClient]);

  const updateSubscription = useCallback(
    async (plan: string, addOns: Record<string, number>) => {
      await axiosInstance.put('/subscription', { plan, addOns });
      await refresh();
    },
    [axiosInstance, refresh]
  );

  // Read the subscription on load and whenever the tab gets the focus back.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    void refresh();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // Keep retrying until SPACE is connected and the contract exists.
  useEffect(() => {
    if (status === 'ready') return;
    const id = setInterval(() => void refresh(), RETRY_MS);
    return () => clearInterval(id);
  }, [status, refresh]);

  // F3 · React to pricing changes
  useEffect(() => {
    const onPricingActivated = () => void refresh();
    spaceClient.on('pricing_actived', onPricingActivated);
    return () => spaceClient.off('pricing_actived', onPricingActivated);
  }, [spaceClient, refresh]);

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        currentSubscription,
        setCurrentSubscription,
        contract,
        pricing,
        refresh,
        updateSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
