import express from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from './config/PricingConfiguration';
import healthRoutes from './routes/health';
import pricingRoutes from './routes/pricing';
import pomodoroRoutes from './routes/pomodoro';
import { container } from './config/container';
import {connect} from 'space-node-client';

const app: express.Server = express();
const port = 3000;

container.spaceClient = connect({
  url: process.env.SPACE_URL || 'http://localhost:5403',
  apiKey: process.env.SPACE_API_KEY || 'your-api-key',
})

container.spaceClient.on('synchronized', () => {
  console.log('Space client synchronized successfully');
})

PricingContextManager.registerContext(new PricingConfiguration());

app.use(express.json());

// Modular routes
app.use('/api', healthRoutes);
app.use('/api', pricingRoutes);
app.use('/api', pomodoroRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
