import { Router } from 'express';
import { PricingContextManager } from 'pricing4ts/server';
import { PricingConfiguration } from '../config/PricingConfiguration';
import { container } from '../config/container';

const router = Router();

router.route('/pricing/trigger')
  .post(async (req, res) => {
    await container.spaceClient?.services.addPricing("TomatoMeter", "./api/resources/TomatoMeter-2.0.yml");
    res.status(200).json({ success: true });
  });

export default router;
