import { useContext, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriptionContext } from '../../contexts/subscriptionContext';
import { SettingsContext } from '../../contexts/settingsContext';
import { updateContract } from '../../utils/contracts';
import axios from '../../lib/axios';
import { Pricing, Contract } from '../../types';
import { PlansGrid } from '../../components/pricing/PlansGrid';
import { AddOnsGrid } from '../../components/pricing/AddOnsGrid';
import { FeatureTable } from '../../components/pricing/FeatureTable';
import PricingLoader from '../../components/loading/PricingLoader';
import { useTimeline } from '../../contexts/timelineContext';

const PricingPage = () => {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [userContract, setUserContract] = useState<Contract | null>(null);

  const subscription = useContext(SubscriptionContext);
  if (!subscription) throw new Error('SubscriptionContext not found');
  const { setCurrentSubscription } = subscription;
  const { toggles } = useContext(SettingsContext);
  const { addEvent } = useTimeline();

  // Notification state
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch pricing and contract
  useEffect(() => {
    axios.get('/contracts/testUserId').then(response => {
      setUserContract(response.data.contract);
    });
    axios.get('/contracts/pricing').then(response => {
      setPricing(response.data);
    });
  }, []);

  // Extract plans/addons from contract
  const userPlan = useMemo(() => {
    if (!userContract || !pricing) return undefined;
    const service = Object.keys(userContract.subscriptionPlans)[0];
    const planKey = userContract.subscriptionPlans[service];
    return planKey;
  }, [userContract, pricing]);

  const userAddOns = useMemo(() => {
    if (!userContract || !pricing) return {};
    const service = Object.keys(userContract.subscriptionAddOns)[0];
    return userContract.subscriptionAddOns[service] ?? {};
  }, [userContract, pricing]);

  // Local state for selection
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  // Sync with contract
  useEffect(() => {
    if (userPlan) setSelectedPlan(userPlan);
    if (userAddOns) setSelectedAddOns(userAddOns);
  }, [userPlan, userAddOns]);

  // Handlers
  const handlePlanChange = async (planKey: string) => {
    setSelectedPlan(planKey);
    setCurrentSubscription([
      planKey,
      ...Object.entries(selectedAddOns).map(([k, v]) => `${k}X${v}`),
    ]);
    await updateContract(planKey, selectedAddOns);
    if (toggles['Show plan/add-on notifications']) {
      setNotification('Plan changed successfully!');
      setTimeout(() => setNotification(null), 2500);
    }
    addEvent({
      type: 'user',
      label: `User changed plan to ${planKey}`,
      plansSnapshot: { [planKey]: plans[planKey] },
      addOnsSnapshot: { ...selectedAddOns }
    });
  };

  const handleAddonChange = async (addonKey: string, value: number) => {
    const newAddOns = { ...selectedAddOns, [addonKey]: value };
    setSelectedAddOns(newAddOns);
    setCurrentSubscription([
      selectedPlan!,
      ...Object.entries(newAddOns).map(([k, v]) => `${k}X${v}`),
    ]);
    await updateContract(selectedPlan!, newAddOns);
    if (toggles['Show plan/add-on notifications']) {
      setNotification('Add-on selection updated!');
      setTimeout(() => setNotification(null), 2500);
    }
    addEvent({
      type: 'user',
      label: `User updated add-ons (${addonKey}: ${value})`,
      plansSnapshot: selectedPlan ? { [selectedPlan]: plans[selectedPlan] } : {},
      addOnsSnapshot: { ...newAddOns }
    });
  };

  // Loader: only render main UI if both userContract and pricing are loaded
  if (!userContract || !pricing) {
    return (
      <PricingLoader
        title="Pricing"
        message="Please wait while we fetch the latest plans and your subscription details."
      />
    );
  }

  // Render helpers
  const plans = pricing?.plans ?? {};
  const addOns = pricing?.addOns ?? {};
  const features = pricing?.features ?? {};
  const usageLimits = pricing?.usageLimits ?? {};

  // UI
  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col gap-8 transition-colors duration-500">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-8 left-1/2 z-50 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-purple-700 dark:text-yellow-300 mb-8 text-center"
      >
        Choose your plan
      </motion.h1>
      {/* PLANS */}
      <PlansGrid
        plans={plans}
        features={features}
        selectedPlan={selectedPlan}
        onSelect={async planKey => await handlePlanChange(planKey)}
      />
      {/* ADDONS */}
      {Object.keys(addOns).length > 0 && (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl font-bold text-purple-700 dark:text-yellow-300 mt-8 mb-2 text-center"
          >
            Add-ons
          </motion.h2>
          <AddOnsGrid
            addOns={addOns}
            selectedAddOns={selectedAddOns}
            selectedPlan={selectedPlan}
            onChange={async (addonKey, value) => await handleAddonChange(addonKey, value)}
          />
        </>
      )}
      {/* FEATURE COMPARISON TABLE */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-xl font-bold text-purple-700 dark:text-yellow-300 mt-8 mb-2 text-center"
      >
        Feature Comparison
      </motion.h2>
      <FeatureTable
        plans={plans}
        features={features}
        usageLimits={usageLimits}
        addOns={addOns}
        selectedPlan={selectedPlan}
        onSelect={async planKey => await handlePlanChange(planKey)}
      />
    </div>
  );
};

export default PricingPage;
