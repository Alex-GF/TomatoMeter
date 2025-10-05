import { TokenService } from 'space-react-client';
import { renewToken } from './helpers';
import { AxiosInstance } from 'axios';

export async function updateContract(plan: string, addons: Record<string, number>, axiosInstance: AxiosInstance, tokenService: TokenService) {
  
  const currentContract = (await axiosInstance.get('/contracts/test-user-id')).data.contract;

  // Update user contract
  await axiosInstance.put('/contracts/test-user-id', {
    contractedServices: {
      tomatometer: currentContract.contractedServices.tomatometer || '1.0.0',
    },
    subscriptionPlans: {
      tomatometer: plan,
    },
    subscriptionAddOns: {
      tomatometer: addons
    }
  });

  await renewToken(tokenService);
}

export const toSubscriptionArr = (plan: string, addons?: { [key: string]: number }) => {
    const arr = [plan];
    if (!addons) return arr;
    Object.entries(addons).forEach(([name, v]) => {
      if (v > 0) arr.push(`${name}X${v}`);
    });
    return arr;
  };