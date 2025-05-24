import express from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from './config/PricingConfiguration';

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

  res.json({plans: plans});
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
