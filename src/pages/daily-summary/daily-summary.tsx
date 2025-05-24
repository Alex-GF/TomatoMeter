import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

interface Session {
  duration: number; // seconds
  productivity: number; // 1-5
  date: string; // ISO string
}

interface DailyStats {
  sessions: Session[];
}

const fetchDailyStats = async (): Promise<DailyStats> => {
  const res = await fetch('/api/pomodoro/daily');
  return res.json();
};

const productivityColors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-blue-400',
  'bg-green-500',
];

const productivityLabels = [
  'Very low',
  'Low',
  'Medium',
  'High',
  'Very high',
];

const PAGE_SIZE = 5;

const DailySummary = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [_, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [displayedDays, setDisplayedDays] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDailyStats().then(data => {
      setStats(data);
      setLoading(false);
      // Show first PAGE_SIZE days
      if (data.sessions.length > 0) {
        const sessionsByDay: Record<string, Session[]> = {};
        data.sessions.forEach(session => {
          const day = session.date.slice(0, 10);
          if (!sessionsByDay[day]) sessionsByDay[day] = [];
          sessionsByDay[day].push(session);
        });
        const sortedDays = Object.keys(sessionsByDay).sort((a, b) => b.localeCompare(a));
        setDisplayedDays(sortedDays.slice(0, PAGE_SIZE));
        if (sortedDays.length <= PAGE_SIZE) setAllLoaded(true);
      }
    });
  }, []);

  // Group sessions by day
  const sessionsByDay: Record<string, Session[]> = {};
  if (stats) {
    stats.sessions.forEach(session => {
      const day = session.date.slice(0, 10);
      if (!sessionsByDay[day]) sessionsByDay[day] = [];
      sessionsByDay[day].push(session);
    });
  }

  // All days sorted descending
  const sortedDays = Object.keys(sessionsByDay).sort((a, b) => b.localeCompare(a));

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || allLoaded || loading || isFetchingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsFetchingMore(true);
        setTimeout(() => {
          setPage(prev => {
            const nextPage = prev + 1;
            const nextDays = sortedDays.slice(0, nextPage * PAGE_SIZE);
            setDisplayedDays(nextDays);
            if (nextDays.length >= sortedDays.length) setAllLoaded(true);
            setIsFetchingMore(false);
            return nextPage;
          });
        }, 1200); // Simulate network delay
      }
    };
    const ref = containerRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, [sortedDays, allLoaded, loading, isFetchingMore]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex flex-col gap-8">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-purple-700 mb-4 text-center">
        Daily Pomodoro Summary
      </motion.h1>
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AnimatePresence>
          {displayedDays.map((day, idx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.05, duration: 0.5, type: 'spring' }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-lg font-bold text-purple-600">
                  {isToday(parseISO(day)) ? 'Today' : isYesterday(parseISO(day)) ? 'Yesterday' : format(parseISO(day), 'EEEE, MMM d')}
                </span>
                <span className="text-xs text-gray-400">{sessionsByDay[day].length} pomodoros</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {sessionsByDay[day].map((session, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center justify-center rounded-xl px-4 py-3 shadow transition-all ${productivityColors[session.productivity-1]}`}
                  >
                    <span className="text-lg font-bold text-white drop-shadow">{Math.round(session.duration/60)} min</span>
                    <span className="text-xs text-white/80">{productivityLabels[session.productivity-1]}</span>
                    <span className="text-xs text-white/60 mt-1">{format(parseISO(session.date), 'HH:mm')}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          {isFetchingMore && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mb-2"
              />
              <span className="text-blue-500 font-semibold">Loading more days...</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default DailySummary;
