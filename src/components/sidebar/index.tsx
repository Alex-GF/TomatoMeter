import { useEffect, useState } from 'react';
import { SIDEBAR_ITEMS } from '../../constants/sidebarItems';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaGem, FaRegStar } from 'react-icons/fa';
import { usePage } from '../../contexts/pageContext';
import { computePriceSplit, revertCamelCaseToString } from '../../utils/helpers';
import { Plan } from '../../types';
import { useSubscription } from '../../hooks/useSubscription';
import useAxios from '../../hooks/useAxios';

const PLAN_ICONS: Record<string, JSX.Element> = {
  expensive: <FaCrown className="inline-block text-yellow-300 mr-2 animate-bounce" size={22} />,
  medium: <FaGem className="inline-block text-blue-300 mr-2 animate-pulse" size={20} />,
  cheap: <FaRegStar className="inline-block text-gray-200 mr-2" size={20} />,
};

const PLAN_COLORS: Record<string, string> = {
  expensive: 'from-yellow-400 to-yellow-600',
  medium: 'from-blue-400 to-blue-600',
  cheap: 'from-gray-400 to-gray-600',
};

const Sidebar = () => {

  const [plans, setPlans] = useState<Record<string, "cheap" | "medium" | "expensive">>({});

  const {currentSubscription} = useSubscription();
  const { selectedPage, setSelectedPage } = usePage();
  const axiosInstance = useAxios();

  // Parse currentSubscription to extract plan and addons
  const planName = currentSubscription[0] || 'basic';
  const activeAddons = currentSubscription
    .slice(1)
    .map(str => {
      const match = str.match(/(.+)X(\d+)/);
      if (match) return [match[1], Number(match[2])];
      return null;
    })
    .filter((item): item is [string, number] => !!item && typeof item[1] === 'number' && item[1] > 0);

  useEffect(() => {
    axiosInstance.get('/contracts/pricing')
      .then(response => {
        const pricing = response.data;
        const priceSplit = computePriceSplit(pricing.plans);
        const splittedPlans: Record<string, "cheap" | "medium" | "expensive"> = {};
        Object.entries(pricing.plans).forEach(([planName, planDetails]) => {
          if (typeof (planDetails as Plan).price === "string"){
            splittedPlans[planName] = 'expensive';
          }else if (((planDetails as Plan).price as number) < priceSplit) {
            splittedPlans[planName] = 'cheap';
          } else if (((planDetails as Plan).price as number) < priceSplit * 2) {
            splittedPlans[planName] = 'medium';
          } else if (((planDetails as Plan).price as number) >= priceSplit * 2) {
            splittedPlans[planName] = 'expensive';
          }else{
            throw new Error(`Invalid price for plan ${planName}: ${(planDetails as Plan).price}`);
          }
        });

        setPlans(splittedPlans);
      })
      .catch(error => {
        console.error('Error fetching pricing data:', error);
      })
  }, [currentSubscription]);

  return (
    <div className="flex h-full min-w-72 w-72 flex-col items-center bg-gray-900 px-4 py-10 text-white">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white text-black overflow-hidden">
          {/* Default user avatar SVG */}
          <svg
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle cx="45" cy="45" r="45" fill="#F3F4F6" />
            <circle cx="45" cy="38" r="18" fill="#D1D5DB" />
            <ellipse cx="45" cy="70" rx="24" ry="14" fill="#D1D5DB" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-semibold">Welcome</h1>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className={`mt-4 rounded-2xl p-0.5 bg-gradient-to-r ${
            PLAN_COLORS[plans[planName]] || PLAN_COLORS['cheap']
          } shadow-xl`}
        >
          <div className="flex flex-col items-center rounded-2xl bg-gray-900/90 px-5 py-4 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              {PLAN_ICONS[plans[planName]] || PLAN_ICONS['cheap']}
              <span className="text-lg font-bold tracking-wide uppercase">{planName} Plan</span>
            </div>
            <AnimatePresence>
              {activeAddons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  className="mt-2 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold text-purple-100 mb-1">
                    Active Add-ons:
                  </span>
                  <ul className="flex flex-wrap justify-center gap-1">
                    {activeAddons.map(([id, v], idx) => (
                      <motion.li
                        key={id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 200 }}
                        className="rounded-full bg-purple-600/80 px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1"
                      >
                        {revertCamelCaseToString(id)}
                        {v > 1 ? <span className="ml-1 text-yellow-200">×{v}</span> : null}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-[11px] text-gray-300 font-medium"
            >
              {plans[planName] === 'expensive' && 'Full power unlocked for your team!'}
              {plans[planName] === 'medium' && 'Almost everything is now at your fingertips!'}
              {plans[planName] === 'cheap' && 'You\'re all set with the essentials!'}
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="h-[0.05rem] w-40 bg-gray-400"></div>
      <nav className="mt-6 w-full flex-grow">
        <ul className="ml-4 space-y-4">
          {SIDEBAR_ITEMS.map(item => (
            <li
              key={item.name}
              className={`${
                selectedPage === item.name
                  ? 'relative pl-2 text-[20px] font-bold text-white before:absolute before:left-[-10px] before:h-full before:w-[5px] before:bg-white'
                  : 'cursor-pointer text-[20px] font-bold text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedPage(item.name)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
