import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubscriptionContext } from '../../contexts/subscriptionContext';

const FEATURES = [
  'Pomodoro timer',
  'Sound notifications',
  'Motivational Quotes',
  'Daily summary',
  'Basic analytics',
  'Advanced analytics',
  'Dark mode',
  'Custom pomodoro duration',
  'Export data to JSON',
];

const PLANS = [
  {
    name: 'FREE',
    price: '0€',
    period: '/month',
    features: [0, 1, 4],
    timerLimit: 3,
    description: 'Perfect to get started',
  },
  {
    name: 'ADVANCED',
    price: '3.99€',
    period: '/month',
    features: [0, 1, 2, 3, 4, 6],
    timerLimit: 10,
    description: 'For regular study sessions',
  },
  {
    name: 'PREMIUM',
    price: '9.99€',
    period: '/month',
    features: [0, 1, 2, 3, 4, 5, 6, 7],
    timerLimit: 15,
    description: 'Unlock all features',
  },
];

const ADDONS = [
  {
    name: 'Extra timers',
    price: '+1€',
    period: '/month',
    description: '+5 extra pomodoros per day (stackable)',
    available: (plan: string) => true,
    multiple: true,
  },
  {
    name: 'Export as JSON',
    price: '+2€',
    period: '/month',
    description: 'Download your study data as JSON',
    available: (plan: string) => plan === 'PREMIUM',
    multiple: false,
  },
];

const Pricing = () => {
  const subscription = useContext(SubscriptionContext);
  if (!subscription) throw new Error('SubscriptionContext not found');
  const { currentSubscription, setCurrentSubscription } = subscription;

  // Parse currentSubscription to extract plan and addons
  // Convention: [plan, ...addonNameXn] e.g. ['PREMIUM', 'Extra timersX2', 'Export as JSONX1']
  const parseSubscription = (subArr: string[]) => {
    const plan = subArr[0] || 'FREE';
    const addons: { [key: string]: number } = {};
    for (let i = 1; i < subArr.length; i++) {
      const match = subArr[i].match(/(.+)X(\d+)/);
      if (match) {
        addons[match[1]] = parseInt(match[2], 10);
      }
    }
    return { plan, addons };
  };
  const toSubscriptionArr = (plan: string, addons: { [key: string]: number }) => {
    const arr = [plan];
    Object.entries(addons).forEach(([name, v]) => {
      if (v > 0) arr.push(`${name}X${v}`);
    });
    return arr;
  };

  const { plan: initialPlan, addons: initialAddons } = parseSubscription(currentSubscription);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [addons, setAddons] = useState<{ [key: string]: number }>({ ...initialAddons });

  // Sync local state with context if context changes externally
  useEffect(() => {
    const { plan, addons } = parseSubscription(currentSubscription);
    setSelectedPlan(plan);
    setAddons({ ...addons });
  }, [currentSubscription]);

  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
    setAddons(prev => {
      const newAddons = { ...prev };
      if (plan !== 'PREMIUM') newAddons['Export as JSON'] = 0;
      // Update context
      setCurrentSubscription(toSubscriptionArr(plan, newAddons));
      return newAddons;
    });
    setCurrentSubscription(toSubscriptionArr(plan, addons));
  };

  const handleAddonChange = (addon: string, value: number) => {
    setAddons(prev => {
      const newAddons = { ...prev, [addon]: value };
      setCurrentSubscription(toSubscriptionArr(selectedPlan, newAddons));
      return newAddons;
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col gap-8 transition-colors duration-500">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-purple-700 dark:text-yellow-300 mb-8 text-center">
        Choose your plan
      </motion.h1>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
            className={`flex flex-col flex-1 min-w-[260px] max-w-[340px] rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 cursor-pointer ${selectedPlan === plan.name ? 'border-purple-500 dark:border-yellow-400 scale-105 bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:scale-105'}`}
            onClick={() => handlePlanChange(plan.name)}
          >
            <span className="text-xl font-bold text-purple-700 dark:text-yellow-300 mb-2">{plan.name}</span>
            <span className="text-3xl font-extrabold text-purple-900 dark:text-yellow-200 mb-2">{plan.price}<span className="text-base font-normal">{plan.period}</span></span>
            <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">{plan.description}</span>
            <ul className="flex flex-col gap-2 mb-4">
              {FEATURES.map((feature, i) => (
                <li key={feature} className={`flex items-center gap-2 text-sm ${plan.features.includes(i) ? 'text-green-600 dark:text-yellow-200' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                  {plan.features.includes(i) ? '✔️' : '✖️'} {feature}
                </li>
              ))}
            </ul>
            <span className="text-xs text-gray-400 dark:text-gray-300">Pomodoro limit: {plan.timerLimit} / day</span>
          </motion.div>
        ))}
      </div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-xl font-bold text-purple-700 dark:text-yellow-300 mt-8 mb-2 text-center">
        Add-ons
      </motion.h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {ADDONS.map((addon, idx) => (
          <motion.div
            key={addon.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
            className={`flex flex-col flex-1 min-w-[220px] max-w-[320px] rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 ${addon.available(selectedPlan) ? 'border-purple-400 dark:border-yellow-400 bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 opacity-60 pointer-events-none'}`}
          >
            <span className="text-lg font-bold text-purple-700 dark:text-yellow-300 mb-1">{addon.name}</span>
            <span className="text-2xl font-extrabold text-purple-900 dark:text-yellow-200 mb-1">{addon.price}<span className="text-base font-normal">{addon.period}</span></span>
            <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">{addon.description}</span>
            {addon.multiple ? (
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-xs text-gray-400 dark:text-gray-300">Quantity:</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={addons[addon.name] || 0}
                  onChange={e => handleAddonChange(addon.name, Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                  className="w-16 rounded-lg border border-purple-300 dark:border-yellow-400 px-2 py-1 text-center text-lg font-bold text-purple-700 dark:text-yellow-200 focus:border-purple-500 focus:outline-none transition"
                />
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`mt-auto rounded-lg px-4 py-2 font-bold shadow transition ${addons[addon.name] ? 'bg-purple-500 dark:bg-yellow-400 text-white dark:text-yellow-900' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => handleAddonChange(addon.name, addons[addon.name] ? 0 : 1)}
                disabled={!addon.available(selectedPlan)}
              >
                {addons[addon.name] ? 'Remove' : 'Add'}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
