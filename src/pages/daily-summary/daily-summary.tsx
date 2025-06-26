import DailySummaryList from '../../components/daily-summary-list';
import { motion } from 'framer-motion';
import { usePage } from '../../contexts/pageContext';
import { Feature, On, Default, feature } from 'pricing4react';

const DailySummaryPage = () => {
  const { setSelectedPage } = usePage();

  return (
    <Feature expression={feature('dailySummary')}>
      <On>
        <DailySummaryList />
      </On>
      <Default>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex flex-col items-center justify-center h-full w-full p-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto">
              <circle cx="12" cy="12" r="10" fill="#fbbf24" className="dark:fill-yellow-400" />
              <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-purple-700 dark:text-yellow-300 mb-2 text-center"
          >
            Feature unavailable
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-md text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md"
          >
            This feature is not available with your current subscription.
            <br />
            Upgrade to the{' '}
            <span className="font-bold text-blue-600 dark:text-yellow-200">ADVANCED</span> plan to
            unlock daily pomodoro summary and more productivity insights!
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 dark:from-yellow-400 dark:to-yellow-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:from-blue-600 hover:to-blue-800 dark:hover:from-yellow-500 dark:hover:to-yellow-700 transition-all duration-300"
            onClick={() => {
              setSelectedPage('Pricing');
            }}
          >
            Upgrade to ADVANCED
          </motion.button>
        </motion.div>
      </Default>
    </Feature>
  );
};

export default DailySummaryPage;
