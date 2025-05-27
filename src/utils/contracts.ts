import axios from '../lib/axios';

export async function updateContract(plan: string, addons: Record<string, number>) {
  // Update user contract
  const newPricingResponse = await axios.put('/contracts', {
    contractedServices: {
      tomatometer: "1.0.0",
    },
    subscriptionPlans: {
      tomatometer: plan,
    },
    subscriptionAddons: {
      tomatometer: addons
    }
  });

  localStorage.setItem("pricingToken", newPricingResponse.headers['pricing-token'] || '');
}