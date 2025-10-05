import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsContext } from '../../contexts/settingsContext';
import { useMotivationalQuotes } from '../settings/settings';
import notificationSound from '../../static/sounds/notification.mp3';
import { Default, Feature, On } from 'space-react-client';
import axios from '../../lib/axios';
import { usePage } from '../../contexts/pageContext';

const PomodoroTimer = () => {
  const { toggles } = useContext(SettingsContext);
  const showQuote = toggles['Motivational quotes'];
  const quote = useMotivationalQuotes(showQuote);
  const customPomodoroEnabled = toggles['Custom pomodoro duration'];
  const customDuration = customPomodoroEnabled
    ? parseInt(localStorage.getItem('customPomodoroDuration') || '25', 10)
    : 25;
  const [secondsLeft, setSecondsLeft] = useState(customDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [productivity, setProductivity] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const {setSelectedPage} = usePage();

  const enableSound = toggles['Enable sound notifications'];

  const playSound = () => {
    if (enableSound) {
      const audio = new Audio(notificationSound);
      audio.play();
    }
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          setShowModal(true);
          handleSaveSession(customDuration * 60);
          playSound(); // Play sound when pomodoro ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIsRunning(false);
    handleSaveSession(customDuration * 60 - secondsLeft);
    setShowModal(true);
    playSound(); // Play sound when pomodoro is stopped
  };

  const resetTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setSecondsLeft(customDuration * 60);
    setIsRunning(false);
  };

  const handleSaveSession = async (duration: number) => {
    await axios.post(
      '/pomodoro/session',
      { duration },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    ).catch(() => {
      window.location.reload();
    });
  };

  const handleProductivitySubmit = async (score: number) => {
    setProductivity(score);
    setShowModal(false);
    await axios.post(
      '/pomodoro/productivity',
      { score },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    resetTimer();
  };

  useEffect(() => {
    setSecondsLeft(customDuration * 60);
  }, [customDuration]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-purple-600 to-blue-500 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <Feature id={'tomatometer-motivationalQuotes'}>
        <On>
          {showQuote && quote && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="mb-8 flex items-center justify-center"
            >
              <span className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 px-6 py-3 text-lg font-semibold text-white shadow-lg animate-pulse">
                {quote}
              </span>
            </motion.div>
          )}
        </On>
      </Feature>

      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="relative flex items-center justify-center w-64 h-64 rounded-full bg-white dark:bg-gray-900 shadow-2xl mb-8 transition-colors duration-500"
          animate={{ boxShadow: isRunning ? '0 0 60px 10px #a78bfa' : '0 0 30px 5px #818cf8' }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="text-6xl font-extrabold text-purple-700 dark:text-yellow-200 select-none"
            key={secondsLeft}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            {minutes}:{seconds}
          </motion.span>
        </motion.div>
        <Feature id={'tomatometer-pomodoroTimer'}>
          <On>
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-6 py-2 rounded-lg bg-purple-600 dark:bg-yellow-400 text-white dark:text-yellow-900 font-bold shadow-lg hover:bg-purple-700 dark:hover:bg-yellow-500 transition"
                onClick={startTimer}
                disabled={isRunning}
              >
                Start
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-6 py-2 rounded-lg bg-red-500 dark:bg-yellow-600 text-white dark:text-yellow-100 font-bold shadow-lg hover:bg-red-600 dark:hover:bg-yellow-700 transition"
                onClick={stopTimer}
                disabled={!isRunning}
              >
                Stop
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-6 py-2 rounded-lg bg-gray-400 dark:bg-gray-700 text-white dark:text-yellow-200 font-bold shadow-lg hover:bg-gray-500 dark:hover:bg-gray-600 transition"
                onClick={resetTimer}
              >
                Reset
              </motion.button>
            </div>
          </On>
          <Default>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center justify-center w-full p-8 bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl min-h-[220px]"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-4"
              >
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" className="mx-auto">
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
                Daily Pomodoro Limit Reached
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-md text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md"
              >
                You have reached your daily pomodoro limit for your current plan.<br />
                Upgrade your subscription to unlock more sessions, or come back tomorrow for a fresh start!
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-gradient-to-r from-purple-500 to-blue-700 dark:from-yellow-400 dark:to-yellow-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:from-purple-600 hover:to-blue-800 dark:hover:from-yellow-500 dark:hover:to-yellow-700 transition-all duration-300"
                onClick={() => {
                  setSelectedPage('Pricing');
                }}
              >
                Upgrade Plan
              </motion.button>
            </motion.div>
          </Default>
        </Feature>
      </motion.div>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl p-8 flex flex-col items-center shadow-2xl transition-colors duration-500"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-700 dark:text-yellow-300">
                How productive was your session?
              </h2>
              <div className="flex gap-3 mb-4">
                {[1, 2, 3, 4, 5].map(score => (
                  <motion.button
                    key={score}
                    whileTap={{ scale: 1.2 }}
                    className={`w-12 h-12 rounded-full text-xl font-bold border-2 border-purple-400 dark:border-yellow-400 ${
                      productivity === score
                        ? 'bg-purple-500 text-white dark:bg-yellow-400 dark:text-yellow-900'
                        : 'bg-white text-purple-700 dark:bg-gray-800 dark:text-yellow-200'
                    } transition`}
                    onClick={() => handleProductivitySubmit(score)}
                  >
                    {score}
                  </motion.button>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                1 = Not productive, 5 = Very productive
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;
