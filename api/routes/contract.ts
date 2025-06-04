import { Router } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';
import { SpaceServiceOperations } from '../utils/spaceOperations';
import { Pricing } from '../types';

const router = Router();

// Update user's contract
router.get('/contracts', async (req, res) => {
  try{
    const contract = await container.spaceClient?.contracts.getContract(testUserId);
    res.status(200).json({ contract: contract });
  }catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

router.get('/contracts/pricing', async (req, res) => {
  try{
    const contract = await container.spaceClient?.contracts.getContract(testUserId);

    const currentPricingVersion = contract?.contractedServices.tomatometer;

    if (!currentPricingVersion) {
      return res.status(404).json({ error: 'No pricing version found' });
    }

    const pricing: Pricing = await SpaceServiceOperations.getPricing("TomatoMeter", currentPricingVersion);

    res.status(200).json(pricing);
  }catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.put('/contracts', async (req, res) => {
  try{
    await container.spaceClient?.contracts.updateContractSubscription(testUserId, req.body);
    res.status(200).json({ message: 'Contract updated successfully' });
  }catch {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

router.post('/contracts/renew-token', async (req, res) => {
  try {
    const token = await container.spaceClient?.features.generateUserPricingToken(testUserId);
    res.status(200).json({ pricingToken: token });
  } catch {
    res.status(500).json({ error: 'Failed to renew token' });
  } 
})

export default router;
