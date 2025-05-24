import express from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from './config/PricingConfiguration';
import { populatePomodoroSessions } from './utils/generators';

const app: express.Server = express();
const port = 3000;

PricingContextManager.registerContext(new PricingConfiguration());

app.use(express.json());

app.get('/api/health-check', (req, res) => {
  res.send('OK');
});

app.get('/api/graph-data', (req, res) => {
  const data = {
    monthlyData: [
      { month: 'Jan', value: 20 },
      { month: 'Feb', value: 40 },
      { month: 'Mar', value: 30 },
      { month: 'Apr', value: 50 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 90 },
      { month: 'Jul', value: 80 },
      { month: 'Aug', value: 100 },
      { month: 'Sep', value: 120 },
      { month: 'Oct', value: 140 },
      { month: 'Nov', value: 110 },
      { month: 'Dec', value: 100 },
    ],
  };
  res.json(data);
});

app.get('/api/plans', (req, res) => {
  const context = PricingContextManager.getContext();
  const plans = context.getPricing().plans;

  res.json({ plans: plans });
});

app
  .route('/api/user/plan')
  .get((req, res) => {
    const context = PricingContextManager.getContext();
    res.status(200).json({ userPlan: context.getUserPlan() });
  })
  .post((req, res) => {
    const context = PricingContextManager.getContext() as PricingConfiguration;
    context.setUserPlan(req.body.userPlan);
    res.status(200).json({ userPlan: context.getUserPlan() });
  });

// Simulated DB for pomodoro sessions and productivity
const pomodoroSessions: Map<string, { duration: number, productivity: number, date: string }[]> = new Map(); // userId -> [{duration, productivity, date}]
populatePomodoroSessions(pomodoroSessions);

// Save pomodoro session duration
app.post('/api/pomodoro/session', (req, res) => {
  const userId = 'demo-user';
  const { duration } = req.body;
  if (!pomodoroSessions.has(userId)) pomodoroSessions.set(userId, []);
  // Temporarily store with productivity = null, will be updated on productivity POST
  pomodoroSessions.get(userId)!.push({ duration, productivity: 0, date: new Date().toISOString() });
  res.status(200).json({ success: true });
});

// Save productivity score
app.post('/api/pomodoro/productivity', (req, res) => {
  const userId = 'demo-user';
  const { score } = req.body;
  const sessions = pomodoroSessions.get(userId);
  if (sessions && sessions.length > 0) {
    // Update last session with productivity score
    sessions[sessions.length - 1].productivity = score;
  }
  res.status(200).json({ success: true });
});

// Weekly stats endpoint
app.get('/api/pomodoro/weekly', (req, res) => {
  const userId = 'demo-user';
  const sessions = (pomodoroSessions.get(userId) || []).filter(s => s.productivity > 0);
  // Get last 7 days
  const now = new Date();
  const weekDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    weekDays.push(d.toISOString().slice(0, 10));
  }
  const dailyStudy = weekDays.map(day => {
    const total = sessions.filter(s => s.date.slice(0, 10) === day).reduce((acc, s) => acc + s.duration, 0);
    return Math.round(total / 60); // minutes
  });
  const dailyProductivity = weekDays.map(day => {
    const prods = sessions.filter(s => s.date.slice(0, 10) === day).map(s => s.productivity);
    return prods.length ? prods.reduce((a, b) => a + b, 0) / prods.length : 0;
  });
  // TomatoMeter
  let totalTime = 0, productiveTime = 0;
  sessions.forEach(s => {
    totalTime += s.duration;
    productiveTime += s.duration * 0.2 * s.productivity;
  });
  const efficiency = totalTime ? productiveTime / totalTime : 0;
  res.json({
    dailyStudy,
    dailyProductivity,
    tomatoMeter: {
      efficiency,
      productiveTime: Math.round(productiveTime / 60), // minutes
    },
    sessions: sessions.filter(s => weekDays.includes(s.date.slice(0, 10))),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
