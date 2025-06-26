import { Router } from 'express';
import { container } from '../config/container';
import { Pricing } from 'pricing4ts';
import { generateUserPricingToken, PricingContextManager } from 'pricing4ts/server';

const router = Router();

// Update user's contract
router.get('/contracts', async (req, res) => {
  try {
    res.status(200).json({ contract: container.userContract });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

router.get('/contracts/pricing', async (req, res) => {
  try {
    const pricing: Pricing = PricingContextManager.getContext().getPricing();

    res.status(200).json(pricing);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.put('/contracts', async (req, res) => {
  try {
    container.userContract = {...container.userContract, ...req.body};
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
