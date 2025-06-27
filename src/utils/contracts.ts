import axios from '../lib/axios';
import { renewToken } from './helpers';

export async function updateContract(plan: string, addons: Record<string, number>) {
  
  const currentContract = (await axios.get('/contracts/testUserId')).data.contract;

  // Update user contract
  await axios.put('/contracts/testUserId', {
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

  await renewToken();
}

export const toSubscriptionArr = (plan: string, addons?: { [key: string]: number }) => {
    const arr = [plan];
    if (!addons) return arr;
    Object.entries(addons).forEach(([name, v]) => {
      if (v > 0) arr.push(`${name}X${v}`);
    });
    return arr;
  };