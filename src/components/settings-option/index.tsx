import { motion } from "framer-motion";
import { useContext } from "react";
import { SettingsContext, SettingsToggle } from "../../contexts/settingsContext";

export default function SettingsOption({idx, option, premium, customDuration, setCustomDuration}: {idx: number, option: {name: string, description: string, featureId: string}, premium?: boolean, customDuration: number, setCustomDuration: (duration: number) => void}) {
  const { toggles, setToggles } = useContext(SettingsContext);
  
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

  return (
    <motion.div
      key={option.name}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5, type: 'spring' }}
      className={`flex flex-col gap-2 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg border-2 ${
        premium ? 'border-yellow-400' : 'border-transparent'
      } transition-colors duration-500`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-800 dark:text-yellow-200 flex items-center gap-2">
            {option.name}
            {premium && (
              <span className="ml-2 rounded bg-yellow-300 px-2 py-0.5 text-xs font-semibold text-yellow-900 animate-pulse">
                Upgrade Plan
              </span>
            )}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            {option.description}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
            toggles[option.name as keyof SettingsToggle]
              ? 'bg-purple-500 dark:bg-yellow-400'
              : 'bg-gray-300 dark:bg-gray-700'
          } ${premium ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !premium && handleToggle(option.name as keyof SettingsToggle)}
          disabled={premium}
        >
          <motion.span
            layout
            className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ${
              toggles[option.name as keyof SettingsToggle] ? 'translate-x-6' : ''
            }`}
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
          <label htmlFor="pomodoro-duration" className="text-sm font-semibold text-purple-700">
            Pomodoro duration:
          </label>
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
  );
}
