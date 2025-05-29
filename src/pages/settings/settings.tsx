import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Default, feature, Feature, On } from 'pricing4react';
import SettingsOption from '../../components/settings-option';
import { usePage } from '../../contexts/pageContext';

const QUOTES = [
  'Stay focused and never give up!',
  'Every pomodoro brings you closer to your goals.',
  'Small steps every day lead to big results.',
  'Discipline is the bridge between goals and accomplishment.',
  'Your future is created by what you do today, not tomorrow.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Great things are done by a series of small things brought together.',
  'Don’t watch the clock; do what it does. Keep going.',
  'The secret of getting ahead is getting started.',
  'You are capable of amazing things!',
];

export function useMotivationalQuotes(enabled: boolean) {
  const [quote, setQuote] = useState<string | null>(null);
  useEffect(() => {
    if (enabled) {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    } else {
      setQuote(null);
    }
  }, [enabled]);
  return quote;
}

const settingsOptions = [
  {
    name: 'Enable sound notifications',
    description: 'Play a sound when a pomodoro ends or break starts.',
    featureId: 'tomatometer-soundNotifications',
  },
  {
    name: 'Dark mode',
    description: 'Switch the interface to a dark color scheme.',
    featureId: 'tomatometer-darkMode',
  },
  {
    name: 'Custom pomodoro duration',
    description: 'Set your own pomodoro and break durations.',
    featureId: 'tomatometer-customPomodoroDuration',
  },
  {
    name: 'Motivational quotes',
    description: 'Show a motivational quote at the start of each pomodoro.',
    featureId: 'tomatometer-motivationalQuotes',
  },
];

const Settings = () => {
  const [customDuration, setCustomDuration] = useState<number>(25);
  const { setSelectedPage } = usePage();

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('customPomodoroDuration');
    if (stored) setCustomDuration(parseInt(stored, 10));
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col gap-8 min-w-[420px] max-w-full transition-colors duration-500">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-purple-700 dark:text-yellow-300 mb-4 text-center"
      >
        Settings
      </motion.h1>
      <div className="flex flex-col gap-6">
        {settingsOptions.map((option, idx) => {
          return (
            <Feature expression={feature(option.featureId)}>
              <On>
                <SettingsOption
                  key={new Date().getTime()}
                  idx={idx}
                  option={option}
                  customDuration={customDuration}
                  setCustomDuration={setCustomDuration}
                />
              </On>
              <Default>
                <SettingsOption
                  key={new Date().getTime()}
                  idx={idx}
                  option={option}
                  premium={true}
                  customDuration={customDuration}
                  setCustomDuration={setCustomDuration}
                />
              </Default>
            </Feature>
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-400 dark:text-gray-300">
          Some features are only available through higher plans.
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 rounded-lg bg-yellow-400 dark:bg-yellow-600 px-6 py-2 font-bold text-yellow-900 dark:text-yellow-100 shadow hover:bg-yellow-300 dark:hover:bg-yellow-500 transition"
          onClick={() => {setSelectedPage('Pricing')}}
        >
          Upgrade Plan
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Settings;
