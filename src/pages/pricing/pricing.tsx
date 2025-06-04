import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SubscriptionContext } from '../../contexts/subscriptionContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { updateContract } from '../../utils/contracts';
import { usePricingToken } from 'space-react-client';
import axios from '../../lib/axios';
import { Pricing, Contract } from '../../types';

const PLAN_COLORS: Record<string, string> = {
  BASIC: 'from-purple-400 to-purple-600',
  ADVANCED: 'from-blue-400 to-blue-600',
  PREMIUM: 'from-green-400 to-green-600',
};

function camelToTitle(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/_/g, ' ');
}

const PricingPage = () => {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [userContract, setUserContract] = useState<Contract | null>(null);
  const subscription = useContext(SubscriptionContext);
  if (!subscription) throw new Error('SubscriptionContext not found');
  const { setCurrentSubscription } = subscription;
  const tokenService = usePricingToken();
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch pricing and contract
  useEffect(() => {
    axios.get('/contracts').then(response => {
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
    setCurrentSubscription([planKey, ...Object.entries(selectedAddOns).map(([k, v]) => `${k}X${v}`)]);
    await updateContract(planKey, selectedAddOns, tokenService);
  };

  const handleAddonChange = async (addonKey: string, value: number) => {
    const newAddOns = { ...selectedAddOns, [addonKey]: value };
    setSelectedAddOns(newAddOns);
    setCurrentSubscription([selectedPlan!, ...Object.entries(newAddOns).map(([k, v]) => `${k}X${v}`)]);
    await updateContract(selectedPlan!, newAddOns, tokenService);
  };

  // Render helpers
  const plans = pricing?.plans ?? {};
  const addOns = pricing?.addOns ?? {};
  const features = pricing?.features ?? {};
  const usageLimits = pricing?.usageLimits ?? {};

  // Get all features in order (by insertion)
  const featureKeys = Object.keys(features);

  // Get all plan keys in order
  const planKeys = Object.keys(plans);

  // Get all add-on keys in order
  const addOnKeys = Object.keys(addOns);

  // Feature comparison table (dynamic, based on pricing)
  const featureTable = (
    <div ref={tableRef} className="mb-10">
      <table className="min-w-[600px] w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left text-lg font-bold text-purple-700 dark:text-yellow-300 px-4 py-2 bg-transparent">
              Feature
            </th>
            {planKeys.map(planKey => (
              <th
                key={planKey}
                className={`text-center text-lg font-bold px-6 py-2 bg-gradient-to-r ${
                  PLAN_COLORS[planKey.toUpperCase()] || PLAN_COLORS.BASIC
                } text-white shadow min-w-[200px] w-[200px]`}
                style={{ width: 160 }}
              >
                {plans[planKey].name ?? camelToTitle(planKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureKeys.map((featureKey, fIdx) => (
            <motion.tr
              key={featureKey}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + fIdx * 0.04 }}
              className="bg-white dark:bg-gray-900/80 hover:bg-purple-50 dark:hover:bg-gray-800/80 transition"
            >
              <td className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-purple-200 dark:border-yellow-300">
                {features[featureKey].name ?? camelToTitle(featureKey)}
              </td>
              {planKeys.map(planKey => {
                const plan = plans[planKey];
                const value = plan.features?.[featureKey];
                const enabled = features[featureKey].valueType === 'BOOLEAN' ? value === true : !!value;
                // Si la feature está vinculada a un usage limit y está activa, mostrar el límite
                const linkedLimit = Object.values(usageLimits).find(lim => lim.linkedFeatures?.includes(featureKey));
                if (linkedLimit && enabled) {
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[200px] w-[200px]"
                      style={{ width: 160 }}
                    >
                      <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-yellow-400 dark:to-yellow-600 px-3 py-1 text-xs font-bold text-white shadow animate-pulse">
                        {plan.usageLimits?.[linkedLimit.name] ?? linkedLimit.defaultValue} / {linkedLimit.period?.unit?.toLowerCase() ?? 'period'}
                      </span>
                    </td>
                  );
                }
                // Si la feature está incluida
                if (enabled) {
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[200px] w-[200px]"
                      style={{ width: 160 }}
                    >
                      <FaCheckCircle className="mx-auto text-green-500 dark:text-yellow-300 animate-pop" size={20} />
                    </td>
                  );
                }
                // Si la feature es un add-on exclusivo de un plan
                // (ejemplo: Export data to JSON solo en PREMIUM como add-on)
                if (
                  addOnKeys.some(
                    addOnKey =>
                      addOns[addOnKey].features?.[featureKey] &&
                      (!addOns[addOnKey].availableFor || addOns[addOnKey].availableFor?.includes(planKey))
                  )
                ) {
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[200px] w-[200px]"
                      style={{ width: 160 }}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-300">Add-on</span>
                    </td>
                  );
                }
                // Si no está incluida
                return (
                  <td
                    key={planKey}
                    className="text-center px-6 py-2 min-w-[200px] w-[200px]"
                    style={{ width: 160 }}
                  >
                    <FaTimesCircle className="mx-auto text-gray-300 dark:text-gray-600" size={20} />
                  </td>
                );
              })}
            </motion.tr>
          ))}
          {/* Fila de botones de selección de plan */}
          <tr>
            <td></td>
            {planKeys.map((planKey) => (
              <td key={planKey} className="text-center py-4">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={async () => await handlePlanChange(planKey)}
                  className={`w-full px-4 py-2 font-bold shadow transition text-white text-base bg-gradient-to-r ${
                    PLAN_COLORS[planKey.toUpperCase()] || PLAN_COLORS.BASIC
                  }`}
                  aria-label={`Select ${plans[planKey].name ?? camelToTitle(planKey)} plan`}
                >
                  {selectedPlan === planKey ? 'Current Plan' : `Select ${plans[planKey].name ?? camelToTitle(planKey)}`}
                </motion.button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  // UI
  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col gap-8 transition-colors duration-500">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-purple-700 dark:text-yellow-300 mb-8 text-center"
      >
        Choose your plan
      </motion.h1>
      {/* PLANS */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {planKeys.map((planKey, idx) => {
          const plan = plans[planKey];
          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
              className={`flex flex-col flex-1 min-w-[260px] max-w-[340px] rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                selectedPlan === planKey
                  ? 'border-purple-500 dark:border-yellow-400 scale-105 bg-white dark:bg-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:scale-105'
              }`}
              onClick={async () => await handlePlanChange(planKey)}
            >
              <span className="text-xl font-bold text-purple-700 dark:text-yellow-300 mb-2">
                {plan.name ?? camelToTitle(planKey)}
              </span>
              <span className="text-3xl font-extrabold text-purple-900 dark:text-yellow-200 mb-2">
                {plan.price}
                <span className="text-base font-normal"> $/month</span>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                {plan.description}
              </span>
              <ul className="flex flex-col gap-2 mb-4">
                {featureKeys.map((featureKey) => {
                  const feature = features[featureKey];
                  const value = plan.features?.[featureKey];
                  const enabled = feature.valueType === 'BOOLEAN' ? value === true : !!value;
                  return (
                    <li
                      key={featureKey}
                      className={`flex items-center gap-2 text-sm ${
                        enabled
                          ? 'text-green-600 dark:text-yellow-200'
                          : 'text-gray-400 dark:text-gray-500 line-through'
                      }`}
                    >
                      {enabled ? '✔️' : '✖️'} {feature.name ?? camelToTitle(featureKey)}
                    </li>
                  );
                })}
              </ul>
              {/* Usage limits */}
              {plan.usageLimits && (
                <div className="text-xs text-gray-400 dark:text-gray-300">
                  {Object.entries(plan.usageLimits).map(([limitKey, limitValue]) => (
                    <div key={limitKey}>
                      {camelToTitle(limitKey)}: {String(limitValue)}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {/* ADDONS */}
      {addOnKeys.length > 0 && (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl font-bold text-purple-700 dark:text-yellow-300 mt-8 mb-2 text-center"
          >
            Add-ons
          </motion.h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {addOnKeys.map((addonKey, idx) => {
              const addon = addOns[addonKey];
              const isScalable = !!addon.usageLimitsExtensions && Object.keys(addon.usageLimitsExtensions).length > 0;
              const quantity = selectedAddOns[addonKey] || 0;
              // Check if available for selected plan
              const available = !addon.availableFor || !selectedPlan || addon.availableFor.includes(selectedPlan);
              return (
                <motion.div
                  key={addonKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
                  className={`flex flex-col flex-1 min-w-[220px] max-w-[320px] rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 ${
                    available
                      ? 'border-purple-400 dark:border-yellow-400 bg-white dark:bg-gray-900'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 opacity-60 pointer-events-none'
                  }`}
                >
                  <span className="text-lg font-bold text-purple-700 dark:text-yellow-300 mb-1">
                    {addon.name ?? camelToTitle(addonKey)}
                  </span>
                  <span className="text-2xl font-extrabold text-purple-900 dark:text-yellow-200 mb-1">
                    {addon.price}
                    <span className="text-base font-normal"> $/month</span>
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                    {addon.description}
                  </span>
                  {isScalable ? (
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-xs text-gray-400 dark:text-gray-300">Quantity:</span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={quantity}
                        onChange={async e =>
                          await handleAddonChange(
                            addonKey,
                            Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                          )
                        }
                        className="w-16 rounded-lg border dark:bg-gray-900 border-purple-300 dark:border-yellow-400 px-2 py-1 text-center text-lg font-bold text-purple-700 dark:text-yellow-200 focus:border-purple-500 focus:outline-none transition"
                      />
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`mt-auto rounded-lg px-4 py-2 font-bold shadow transition ${
                        quantity
                          ? 'bg-purple-500 dark:bg-yellow-400 text-white dark:text-yellow-900'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                      onClick={async () => await handleAddonChange(addonKey, quantity ? 0 : 1)}
                      disabled={!available}
                    >
                      {quantity ? 'Remove' : 'Add'}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
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
      {featureTable}
    </div>
  );
};

export default PricingPage;
