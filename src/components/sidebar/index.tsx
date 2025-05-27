import { useContext } from 'react';
import { SIDEBAR_ITEMS } from '../../apps/demo';
import { SubscriptionContext } from '../../contexts/subscriptionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaGem, FaRegStar } from 'react-icons/fa';
import { usePage } from '../../contexts/pageContext';

const PLAN_ICONS: Record<string, JSX.Element> = {
  PREMIUM: <FaCrown className="inline-block text-yellow-300 mr-2 animate-bounce" size={22} />,
  ADVANCED: <FaGem className="inline-block text-blue-300 mr-2 animate-pulse" size={20} />,
  FREE: <FaRegStar className="inline-block text-gray-200 mr-2" size={20} />,
};

const PLAN_COLORS: Record<string, string> = {
  PREMIUM: 'from-yellow-400 to-yellow-600',
  ADVANCED: 'from-blue-400 to-blue-600',
  FREE: 'from-gray-400 to-gray-600',
};

const Sidebar = () => {
  const subscription = useContext(SubscriptionContext);
  if (!subscription) throw new Error('SubscriptionContext not found');
  const { currentSubscription } = subscription;
  const { selectedPage, setSelectedPage } = usePage();

  // Parse currentSubscription to extract plan and addons
  const planName = currentSubscription[0] || 'FREE';
  const activeAddons = currentSubscription
    .slice(1)
    .map(str => {
      const match = str.match(/(.+)X(\d+)/);
      if (match) return [match[1], parseInt(match[2], 10)];
      return null;
    })
    .filter(Boolean) as [string, number][];

  return (
    <div className="flex h-full min-w-72 flex-col items-center bg-gray-900 px-4 py-10 text-white">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white text-black">
          <span className="text-[40px] font-bold">U</span>
        </div>
        <h1 className="mt-4 text-xl font-semibold">Welcome</h1>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className={`mt-4 rounded-2xl p-0.5 bg-gradient-to-r ${
            PLAN_COLORS[planName] || PLAN_COLORS['FREE']
          } shadow-xl`}
        >
          <div className="flex flex-col items-center rounded-2xl bg-gray-900/90 px-5 py-4 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              {PLAN_ICONS[planName] || PLAN_ICONS['FREE']}
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
                    {activeAddons.map(([name, v], idx) => (
                      <motion.li
                        key={name}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 200 }}
                        className="rounded-full bg-purple-600/80 px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1"
                      >
                        {name}
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
              {planName === 'PREMIUM' && 'You have access to all features!'}
              {planName === 'ADVANCED' && 'Most features unlocked. Upgrade for more.'}
              {planName === 'FREE' && 'Basic features enabled. Upgrade for more!'}
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
