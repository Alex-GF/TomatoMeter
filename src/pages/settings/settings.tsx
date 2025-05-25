import { createContext, useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const QUOTES = [
  "Stay focused and never give up!",
  "Every pomodoro brings you closer to your goals.",
  "Small steps every day lead to big results.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your future is created by what you do today, not tomorrow.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Great things are done by a series of small things brought together.",
  "Don’t watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "You are capable of amazing things!"
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
    premium: false,
  },
  {
    name: 'Dark mode',
    description: 'Switch the interface to a dark color scheme.',
    premium: false,
  },
  {
    name: 'Custom pomodoro duration',
    description: 'Set your own pomodoro and break durations.',
    premium: false,
  },
  {
    name: 'Motivational quotes',
    description: 'Show a motivational quote at the start of each pomodoro.',
    premium: false,
  },
];

export type SettingsToggle = {
  'Enable sound notifications': boolean;
  'Dark mode': boolean;
  'Custom pomodoro duration': boolean;
  'Motivational quotes': boolean;
};

export const SettingsContext = createContext<{ toggles: SettingsToggle; setToggles: React.Dispatch<React.SetStateAction<SettingsToggle>>; }>({
  toggles: {
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Motivational quotes': true,
  },
  setToggles: () => {},
});

const Settings = () => {
  const { toggles, setToggles } = useContext(SettingsContext);
  const [customDuration, setCustomDuration] = useState<number>(25);

  const handleToggle = (name: keyof SettingsToggle) => {
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 5) value = 5;
    if (value > 60) value = 60;
    setCustomDuration(value);
    localStorage.setItem('customPomodoroDuration', value.toString());
  };

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('customPomodoroDuration');
    if (stored) setCustomDuration(parseInt(stored, 10));
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 flex flex-col gap-8 min-w-[420px] max-w-full transition-colors duration-500">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-purple-700 dark:text-yellow-300 mb-4 text-center">
        Settings
      </motion.h1>
      <div className="flex flex-col gap-6">
        {settingsOptions.map((option, idx) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5, type: 'spring' }}
            className={`flex flex-col gap-2 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg border-2 ${option.premium ? 'border-yellow-400' : 'border-transparent'} transition-colors duration-500`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 dark:text-yellow-200 flex items-center gap-2">
                  {option.name}
                  {option.premium && (
                    <span className="ml-2 rounded bg-yellow-300 px-2 py-0.5 text-xs font-semibold text-yellow-900 animate-pulse">Premium</span>
                  )}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">{option.description}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${toggles[option.name as keyof SettingsToggle] ? 'bg-purple-500 dark:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-700'} ${option.premium ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !option.premium && handleToggle(option.name as keyof SettingsToggle)}
                disabled={option.premium}
              >
                <motion.span
                  layout
                  className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ${toggles[option.name as keyof SettingsToggle] ? 'translate-x-6' : ''}`}
                  animate={{ x: toggles[option.name as keyof SettingsToggle] ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              </motion.button>
            </div>
            {option.name === 'Custom pomodoro duration' && toggles['Custom pomodoro duration'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="mt-4 flex items-center gap-3"
              >
                <label htmlFor="pomodoro-duration" className="text-sm font-semibold text-purple-700">Pomodoro duration:</label>
                <input
                  id="pomodoro-duration"
                  type="number"
                  min={5}
                  max={60}
                  value={customDuration}
                  onChange={handleDurationChange}
                  className="w-20 rounded-lg border border-purple-300 px-2 py-1 text-center text-lg font-bold text-purple-700 focus:border-purple-500 focus:outline-none transition"
                />
                <span className="text-sm text-gray-500">minutes (5-60)</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-400 dark:text-gray-300">Some features are only available for premium users.</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 rounded-lg bg-yellow-400 dark:bg-yellow-600 px-6 py-2 font-bold text-yellow-900 dark:text-yellow-100 shadow hover:bg-yellow-300 dark:hover:bg-yellow-500 transition"
        >
          Upgrade Plan
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Settings;
