import { Router } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';

const router = Router();

// Update user's contract
router.put('/contracts', async (req, res) => {
  try{
    await container.spaceClient?.contracts.updateContractSubscription(testUserId, req.body);
    res.status(200).json({ message: 'Contract updated successfully' });
  }catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

export default router;
