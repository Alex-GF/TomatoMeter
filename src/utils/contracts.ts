export async function updateContract(plan: string, addons: Record<string, number>) {
  // Update user contract
      const newPricingToken = await fetch('/api/contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractedServices: {
            tomatometer: "1.0.0",
          },
          subscriptionPlans: {
            tomatometer: plan,
          },
          subscriptionAddons: {
            tomatometer : addons
          }
        })
      })
  
      localStorage.setItem("pricingToken", newPricingToken.headers.get('Pricing-Token') || '');
}