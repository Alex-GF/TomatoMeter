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
    premium: true,
  },
  {
    name: 'Advanced productivity analytics',
    description: 'Unlock detailed productivity charts and export options.',
    premium: true,
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
  'Advanced productivity analytics': boolean;
  'Motivational quotes': boolean;
};

export const SettingsContext = createContext<{ toggles: SettingsToggle; setToggles: React.Dispatch<React.SetStateAction<SettingsToggle>>; }>({
  toggles: {
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Advanced productivity analytics': false,
    'Motivational quotes': true,
  },
  setToggles: () => {},
});

const Settings = () => {
  const { toggles, setToggles } = useContext(SettingsContext);

  const handleToggle = (name: keyof SettingsToggle) => {
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex flex-col gap-8 min-w-[420px] max-w-full">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-purple-700 mb-4 text-center">
          Settings
        </motion.h1>
        <div className="flex flex-col gap-6">
          {settingsOptions.map((option, idx) => (
            <motion.div
              key={option.name}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5, type: 'spring' }}
              className={`flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg border-2 ${option.premium ? 'border-yellow-400' : 'border-transparent'}`}
            >
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {option.name}
                  {option.premium && (
                    <span className="ml-2 rounded bg-yellow-300 px-2 py-0.5 text-xs font-semibold text-yellow-900 animate-pulse">Premium</span>
                  )}
                </span>
                <span className="text-sm text-gray-500 mt-1">{option.description}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${toggles[option.name as keyof SettingsToggle] ? 'bg-purple-500' : 'bg-gray-300'} ${option.premium ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !option.premium && handleToggle(option.name as keyof SettingsToggle)}
                disabled={option.premium}
              >
                <motion.span
                  layout
                  className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${toggles[option.name as keyof SettingsToggle] ? 'translate-x-6' : ''}`}
                  animate={{ x: toggles[option.name as keyof SettingsToggle] ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-400">Some features are only available for premium users.</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 rounded-lg bg-yellow-400 px-6 py-2 font-bold text-yellow-900 shadow hover:bg-yellow-300 transition"
          >
            Upgrade to Premium
          </motion.button>
        </motion.div>
      </div>
    </SettingsContext.Provider>
  );
};

export default Settings;
