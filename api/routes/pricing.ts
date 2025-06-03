import { Router } from 'express';
import { SpaceServiceOperations } from '../utils/spaceOperations';

const router = Router();

router.route('/pricing/trigger')
  .post(async (req, res) => {
    try{
      await SpaceServiceOperations.addPricing("TomatoMeter", "./api/resources/TomatoMeter-2.0.yml");
      res.status(200).json({ success: true });
    }catch (error) {
      res.status(500).json({ error: 'Failed to trigger pricing update' });
    }
  });

export default router;
