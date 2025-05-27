import express from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from './config/PricingConfiguration';
import healthRoutes from './routes/health';
import pricingRoutes from './routes/pricing';
import pomodoroRoutes from './routes/pomodoro';

const app: express.Server = express();
const port = 3000;

PricingContextManager.registerContext(new PricingConfiguration());

app.use(express.json());

// Modular routes
app.use('/api', healthRoutes);
app.use('/api', pricingRoutes);
app.use('/api', pomodoroRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
