import { Router } from 'express';
import { SpaceServiceOperations } from '../utils/spaceOperations';


const router = Router();

router.route('/pricings/:serviceName/:pricingVersion')
  .get(async (req, res) => {
    const pricing = await SpaceServiceOperations.getPricing(req.params.serviceName, req.params.pricingVersion)

    res.status(200).json(pricing);
  });

export default router;
