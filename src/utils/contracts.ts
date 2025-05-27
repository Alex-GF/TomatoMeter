import axios from '../lib/axios';

export async function updateContract(plan: string, addons: Record<string, number>) {
  // Update user contract
  await axios.put('/contracts', {
    contractedServices: {
      tomatometer: "1.0.0",
    },
    subscriptionPlans: {
      tomatometer: plan,
    },
    subscriptionAddOns: {
      tomatometer: addons
    }
  });
}