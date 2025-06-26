import { Router } from 'express';
import { PricingContextManager } from 'pricing4ts/server';

const router = Router();

router.route('/pricings/:serviceName/:pricingVersion')
  .get(async (req, res) => {
    const pricing = PricingContextManager.getContext().getPricing();

    res.status(200).json(pricing);
  });

export default router;
