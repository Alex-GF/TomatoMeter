import { Router } from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from '../config/PricingConfiguration';
import { container } from '../config/container';

const router = Router();

router.route('/pricing/trigger')
  .post(async (req, res) => {
    try{
      await container.spaceClient?.services.addPricing("TomatoMeter", "./api/resources/TomatoMeter-2.0.yml");
      res.status(200).json({ success: true });
    }catch (error) {
      res.status(500).json({ error: 'Failed to trigger pricing update' });
    }
  });

export default router;
