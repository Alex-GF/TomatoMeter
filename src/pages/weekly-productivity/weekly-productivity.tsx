import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDuration, intervalToDuration } from 'date-fns';
import { SettingsContext } from '../settings/settings';

interface Session {
  duration: number; // seconds
  productivity: number; // 1-5
  date: string; // ISO string
}

interface WeeklyStats {
  dailyStudy: number[]; // minutes per day
  dailyProductivity: number[]; // 1-5 per day
  TomatoScore: {
    efficiency: number; // 0-1
    productiveTime: number; // minutes
  };
  sessions: Session[];
}

const fetchWeeklyStats = async (): Promise<WeeklyStats> => {
  const res = await fetch('/api/pomodoro/weekly');
  return res.json();
};

const barVariants = {
  initial: { height: 0, opacity: 0 },
  animate: (h: number) => ({ height: h, opacity: 1 }),
};

function getWeekDays(): string[] {
  // Returns the last 7 days ending today, formatted as short weekday names
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  return days;
}

function formatMinutesToDuration(minutes: number): string {
  const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 });
  return formatDuration(duration, { format: ['days', 'hours', 'minutes'] })
    .replace(/ days?/, 'd')
    .replace(/ hours?/, 'h')
    .replace(/ minutes?/, 'm');
}

const WeeklyProductivity = () => {
  const { toggles } = useContext(SettingsContext);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-purple-400 border-t-transparent"
        />
      </div>
    );

  // Normalization for bar heights
  const maxStudy = Math.max(...stats.dailyStudy, 1);
  const maxProductivity = Math.max(...stats.dailyProductivity, 1);
  const normalizedStudy = stats.dailyStudy.map(v => v / maxStudy);
  const normalizedProductivity = stats.dailyProductivity.map(v => v / maxProductivity);

  const weekDays = getWeekDays();

  // Only count pomodoros of exactly 25 min (1500s) for completed this week
  const completedPomodoros = stats.sessions.filter(s => s.duration === 1500).length;

  // Advanced analytics: calculate streaks and best day
  let bestDayIdx = 0;
  let bestDayValue = 0;
  stats.dailyStudy.forEach((v, i) => {
    if (v > bestDayValue) {
      bestDayValue = v;
      bestDayIdx = i;
    }
  });
  // Calculate streaks (days with at least 1 pomodoro)
  let currentStreak = 0;
  let maxStreak = 0;
  for (let i = stats.dailyStudy.length - 1; i >= 0; i--) {
    if (stats.dailyStudy[i] > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-8 overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 p-8 transition-colors duration-500 dark:from-gray-900 dark:to-gray-800">
      {/* TomatoScore */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-white p-8 shadow-xl transition-colors duration-500 dark:bg-gray-900 md:flex-row"
      >
        <div className="flex flex-1 flex-col items-center">
          <span className="mb-8 text-3xl font-bold text-purple-700 dark:text-yellow-300">
            Tomato Score
          </span>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center gap-6"
          >
            <div className="flex flex-col items-center">
              <span className="text-5xl font-extrabold text-green-500 dark:text-yellow-200">
                {Math.round(stats.TomatoScore.efficiency * 100)}%
              </span>
              <span className="font-semibold text-gray-500 dark:text-gray-300">Efficiency</span>
            </div>
            <div className="h-16 w-1 rounded-full bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-extrabold text-blue-500 dark:text-yellow-200">
                {formatMinutesToDuration(stats.TomatoScore.productiveTime)}
              </span>
              <span className="font-semibold text-gray-500 dark:text-gray-300">
                Real productive time
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Advanced Analytics (Premium) */}

      <>
        <section className="flex w-full flex-col justify-center gap-6 md:flex-row">
          {/* Average daily study time widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-colors duration-500 dark:bg-gray-900"
          >
            <span className="text-center text-xl font-bold text-purple-700 dark:text-yellow-300">
              Average daily study time (min)
            </span>
            <div className="mt-6 flex h-48 items-end gap-4">
              {normalizedStudy.map((norm, i) => (
                <motion.div
                  key={i}
                  custom={norm * 180}
                  variants={barVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-1 flex-col items-center justify-end"
                >
                  <motion.div
                    className="w-8 rounded-t-lg bg-purple-400 dark:bg-yellow-400"
                    style={{ minHeight: 8 }}
                    animate={{ height: Math.max(norm * 180, 8) }}
                    transition={{ type: 'spring', stiffness: 120 }}
                  />
                  <span className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    {weekDays[i]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-300">
                    {(stats.dailyStudy[i] / 60).toFixed(1)}h
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Average daily productivity widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-colors duration-500 dark:bg-gray-900"
          >
            <span className="text-center text-xl font-bold text-blue-700 dark:text-yellow-300">
              Average daily productivity
            </span>
            <div className="mt-6 flex h-48 items-end gap-4">
              {normalizedProductivity.map((norm, i) => (
                <motion.div
                  key={i}
                  custom={norm * 180}
                  variants={barVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-1 flex-col items-center justify-end"
                >
                  <motion.div
                    className="w-8 rounded-t-lg bg-blue-400 dark:bg-yellow-400"
                    style={{ minHeight: 8 }}
                    animate={{ height: Math.max(norm * 180, 8) }}
                    transition={{ type: 'spring', stiffness: 120 }}
                  />
                  <span className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    {weekDays[i]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-300">
                    {stats.dailyProductivity[i].toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </>

      {/* Extra Widget: Pomodoros completed */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-lg transition-colors duration-500 dark:bg-gray-900"
      >
        <span className="mb-2 text-xl font-bold text-pink-700 dark:text-yellow-300">
          Pomodoros completed this week
        </span>
        <span className="text-4xl font-extrabold text-pink-500 dark:text-yellow-200">
          {completedPomodoros}
        </span>
      </motion.div>

      {/* Advanced Analytics (Premium) */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-2 flex flex-col items-center justify-between gap-8 rounded-2xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-200 to-yellow-400 p-6 shadow-lg dark:border-yellow-600 dark:from-yellow-700 dark:to-yellow-900 md:flex-row"
      >
        <div className="flex flex-1 flex-col items-center">
          <span className="mb-2 text-lg font-bold text-yellow-900 dark:text-yellow-100">
            Best Study Day
          </span>
          <span className="text-3xl font-extrabold text-yellow-700 dark:text-yellow-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][bestDayIdx]}
          </span>
          <span className="text-sm text-yellow-800 dark:text-yellow-300">{bestDayValue} min</span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="mb-2 text-lg font-bold text-yellow-900 dark:text-yellow-100">
            Current Streak
          </span>
          <span className="text-3xl font-extrabold text-yellow-700 dark:text-yellow-200">
            {currentStreak} days
          </span>
          <span className="text-sm text-yellow-800 dark:text-yellow-300">
            Max streak: {maxStreak} days
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="mb-2 text-lg font-bold text-yellow-900 dark:text-yellow-100">
            Export Data
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="mt-2 rounded-lg bg-yellow-400 px-6 py-2 font-bold text-yellow-900 shadow transition hover:bg-yellow-300 dark:bg-yellow-600 dark:text-yellow-100 dark:hover:bg-yellow-500"
            onClick={() => {
              const blob = new Blob([JSON.stringify(stats.sessions, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'pomodoro_sessions.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download JSON
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WeeklyProductivity;
