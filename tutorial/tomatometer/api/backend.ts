import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health';
import pomodoroRoutes from './routes/pomodoro';
import subscriptionRoutes from './routes/subscription';
import { connectToSpace } from './space/client';

const app: express.Express = express();
const port = 8080;

connectToSpace();

app.use(express.json());
app.use(cors());

app.use('/api', healthRoutes);
app.use('/api', pomodoroRoutes);
app.use('/api', subscriptionRoutes);

app.listen(port, () => {
  console.log(`TomatoMeter API running on http://localhost:${port}`);
});
