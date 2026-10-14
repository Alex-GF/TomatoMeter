import PomodoroTimer from '../pages/pomodoro-timer/pomodoro-timer';
import WeeklyProductivity from '../pages/weekly-productivity/weekly-productivity';
import Pricing from '../pages/pricing/pricing';
import DailySummaryPage from '../pages/daily-summary/daily-summary';
import Settings from '../pages/settings/settings';

export const SIDEBAR_ITEMS = [
  { name: 'Pomodoro Timer', component: <PomodoroTimer /> },
  { name: 'Daily Summary', component: <DailySummaryPage /> },
  { name: 'Weekly Productivity', component: <WeeklyProductivity /> },
  { name: 'Pricing', component: <Pricing /> },
  { name: 'Settings', component: <Settings /> },
];
