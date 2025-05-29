import { Router } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';

const router = Router();

// Update user's contract
router.get('/contracts', async (req, res) => {
  try{
    const contract = await container.spaceClient?.contracts.getContract(testUserId);
    res.status(200).json({ contract: contract });
  }catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.put('/contracts', async (req, res) => {
  try{
    await container.spaceClient?.contracts.updateContractSubscription(testUserId, req.body);
    res.status(200).json({ message: 'Contract updated successfully' });
  }catch (error) {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

export default router;
