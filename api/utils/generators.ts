import { faker } from '@faker-js/faker';
import { getCurrentUser } from '../middlewares/requestContext';

function populatePomodoroSessions(pomodoroSessions: Map<string, { duration: number, productivity: number, date: string }[]>): void {
  const userId = getCurrentUser() ?? "testUserId";
  const now = new Date();
  const sessions: { duration: number, productivity: number, date: string }[] = [];
  for (let d = 0; d < 30; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const entries = faker.number.int({ min: 0, max: 15 });
    for (let i = 0; i < entries; i++) {
      // 80% chance of 25 min, 20% chance of 5-24 min
      let duration = 1500;
      if (faker.number.int({ min: 1, max: 100 }) > 80) {
        duration = faker.number.int({ min: 300, max: 1499 });
      }
      const productivity = faker.number.int({ min: 1, max: 5 });
      // Random time within the day
      const hour = faker.number.int({ min: 6, max: 23 });
      const minute = faker.number.int({ min: 0, max: 59 });
      const sessionDate = new Date(day);
      sessionDate.setHours(hour, minute, 0, 0);
      sessions.push({
        duration,
        productivity,
        date: sessionDate.toISOString(),
      });
    }
  }
  pomodoroSessions.set(userId, sessions.sort((a, b) => a.date.localeCompare(b.date)));
}

export { populatePomodoroSessions };