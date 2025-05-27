import { useContext, useState } from 'react';
import Sidebar from '../../components/sidebar';
import PomodoroTimer from '../../pages/pomodoro-timer/pomodoro-timer';
import WeeklyProductivity from '../../pages/weekly-productivity/weekly-productivity';
import { SettingsContext } from '../../contexts/settingsContext';
import Pricing from '../../pages/pricing/pricing';
import { usePage } from '../../contexts/pageContext';
import DailySummaryPage from '../../pages/daily-summary/daily-summary';
import Settings from '../../pages/settings/settings';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../lib/axios';

export const SIDEBAR_ITEMS = [
  { name: 'Pomodoro Timer', component: <PomodoroTimer /> },
  { name: 'Daily Summary', component: <DailySummaryPage /> },
  { name: 'Weekly Productivity', component: <WeeklyProductivity /> },
  { name: 'Pricing', component: <Pricing /> },
  { name: 'Settings', component: <Settings /> },
];

export function DemoApp() {
  const { toggles, setToggles } = useContext(SettingsContext);
  const { selectedPage } = usePage();
  const [showModal, setShowModal] = useState(false);

  async function handleTrigger() {
    await axios.post('/pricing/trigger');
    setShowModal(true);
  }

  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw] relative">
        <div className="h-[75vh] w-[75vw] max-w-[1500px] overflow-hidden rounded-[25px] bg-white shadow-lg">
          <div className="flex h-full bg-demo-primary">
            <Sidebar />
            <div className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]">
              <div className={`flex h-full w-full items-center justify-center bg-white`}>
                <div className="w-full h-full overflow-y-auto">
                  {SIDEBAR_ITEMS.find(item => item.name === selectedPage)!.component}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Animated button below the main window */}
        <div className="flex w-full justify-center mt-6 absolute bottom-8 left-0 right-0 p-4">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gradient-to-r from-purple-500 to-blue-700 dark:from-yellow-400 dark:to-yellow-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:from-purple-600 hover:to-blue-800 dark:hover:from-yellow-500 dark:hover:to-yellow-700 transition-all duration-300"
            onClick={handleTrigger}
          >
            Trigger Pricing Update
          </motion.button>
        </div>
        {/* Modal for pricing update */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-[90vw] w-[400px]"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="mx-auto">
                    <circle cx="12" cy="12" r="10" fill="#6366f1" className="dark:fill-yellow-400" />
                    <path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-bold text-purple-700 dark:text-yellow-300 mb-2 text-center">
                  Pricing Version Updated!
                </h2>
                <p className="text-md text-gray-600 dark:text-gray-300 mb-6 text-center">
                  TomatoMeter pricing has been successfully updated to <span className="font-bold text-blue-600 dark:text-yellow-200">version 2.0</span>.<br />
                  Enjoy the new features and improvements!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 dark:from-yellow-400 dark:to-yellow-600 px-6 py-2 font-bold text-white shadow hover:from-blue-600 hover:to-purple-700 dark:hover:from-yellow-500 dark:hover:to-yellow-700 transition"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </SettingsContext.Provider>
  );
}
