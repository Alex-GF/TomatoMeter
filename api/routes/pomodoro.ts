import { Router } from 'express';
import { populatePomodoroSessions } from '../utils/generators';

const router = Router();

// Simulated DB for pomodoro sessions and productivity
const pomodoroSessions: Map<string, { duration: number, productivity: number, date: string }[]> = new Map(); // userId -> [{duration, productivity, date}]
populatePomodoroSessions(pomodoroSessions);

// Save pomodoro session duration
router.post('/pomodoro/session', (req, res) => {
  const userId = 'demo-user';
  const { duration } = req.body;
  if (!pomodoroSessions.has(userId)) pomodoroSessions.set(userId, []);
  pomodoroSessions.get(userId)!.push({ duration, productivity: 0, date: new Date().toISOString() });
  res.status(200).json({ success: true });
});

// Save productivity score
router.post('/pomodoro/productivity', (req, res) => {
  const userId = 'demo-user';
  const { score } = req.body;
  const sessions = pomodoroSessions.get(userId);
  if (sessions && sessions.length > 0) {
    sessions[sessions.length - 1].productivity = score;
  }
  res.status(200).json({ success: true });
});

// Weekly stats endpoint
router.get('/pomodoro/weekly', (req, res) => {
  const userId = 'demo-user';
  const sessions = (pomodoroSessions.get(userId) || []).filter(s => s.productivity > 0);
  const now = new Date();
  const weekDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    weekDays.push(d.toISOString().slice(0, 10));
  }
  const dailyStudy = weekDays.map(day => {
    const total = sessions.filter(s => s.date.slice(0, 10) === day).reduce((acc, s) => acc + s.duration, 0);
    return Math.round(total / 60);
  });
  const dailyProductivity = weekDays.map(day => {
    const prods = sessions.filter(s => s.date.slice(0, 10) === day).map(s => s.productivity);
    return prods.length ? prods.reduce((a, b) => a + b, 0) / prods.length : 0;
  });
  let totalTime = 0, productiveTime = 0;
  sessions.forEach(s => {
    totalTime += s.duration;
    productiveTime += s.duration * 0.2 * s.productivity;
  });
  const efficiency = totalTime ? productiveTime / totalTime : 0;
  res.json({
    dailyStudy,
    dailyProductivity,
    TomatoScore: {
      efficiency,
      productiveTime: Math.round(productiveTime / 60),
    },
    sessions: sessions.filter(s => weekDays.includes(s.date.slice(0, 10))),
  });
});

// Daily summary endpoint
router.get('/pomodoro/daily', (req, res) => {
  const userId = 'demo-user';
  const sessions = (pomodoroSessions.get(userId) || []).filter(s => s.productivity > 0);
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  const filtered = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
  res.json({ sessions: filtered.sort((a, b) => b.date.localeCompare(a.date)) });
});

export default router;
