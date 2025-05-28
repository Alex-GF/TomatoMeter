import express from 'express';
import healthRoutes from './routes/health';
import pricingRoutes from './routes/pricing';
import pomodoroRoutes from './routes/pomodoro';
import contractsRoutes from './routes/contract';
import featureChecker from './middlewares/featureChecker';
import { configureSpaceClient } from './utils/configurators';
import cors from 'cors';

const app: express.Server = express();
const port = 8080;

configureSpaceClient();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: ['Pricing-Token'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Pricing-Token'],
}));

app.use(featureChecker);

// Modular routes
app.use('/api', healthRoutes);
app.use('/api', pricingRoutes);
app.use('/api', pomodoroRoutes);
app.use('/api', pomodoroRoutes);
app.use('/api', contractsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
