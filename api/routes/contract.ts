import { Router } from 'express';
import { getContractForUser, updateContractForUser } from '../config/container';
import { Pricing } from 'pricing4ts';
import { generateUserPricingToken, PricingContextManager } from 'pricing4ts/server';

const router = Router();

router.get('/contracts/pricing', async (req, res) => {
  try {
    const pricing: Pricing = PricingContextManager.getContext().getPricing();
    
    res.status(200).json(pricing);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.get('/contracts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    res.status(200).json({ contract: getContractForUser(userId as string) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.put('/contracts/:userId', async (req, res) => {
  try {

    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    updateContractForUser(userId, {...getContractForUser(userId), ...req.body});
    res.status(200).json({ message: 'Contract updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

router.post('/contracts/renew-token', async (req, res) => {
  try {
    const token = generateUserPricingToken();
    res.status(200).json({ pricingToken: token });
  } catch {
    res.status(500).json({ error: 'Failed to renew token' });
  }
});

export default router;
