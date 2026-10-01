import { Router } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';
import { SpaceServiceOperations } from '../utils/spaceOperations';
import { Pricing } from '../types';
import { getCurrentUser } from '../middlewares/requestContext';

const router = Router();

router.get('/contracts/pricing', async (req, res) => {
  try {
    const userId = getCurrentUser() ?? testUserId;
    
    const contract = await container.spaceClient?.contracts.getContract(userId);

    const currentPricingVersion = contract?.contractedServices.tomatometer;

    if (!currentPricingVersion) {
      return res.status(404).json({ error: 'No pricing version found' });
    }

    const pricing: Pricing = await SpaceServiceOperations.getPricing(
      'tomatometer',
      currentPricingVersion
    );

    res.status(200).json(pricing);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Read SPACE's persisted subscription and renew the response token from fresh data.
router.get('/contracts/subscription', async (req, res) => {
  try {
    const userId = getCurrentUser() ?? testUserId;
    const client = container.spaceClient;
    if (!client) throw new Error('SPACE client is not initialized');
    // The SDK does not invalidate its local cache on pricing activation.
    await client.getCache().invalidateUser(userId);
    const contract = await client.contracts.getContract(userId);
    const version = contract.contractedServices.tomatometer;
    if (!version) return res.status(404).json({ error: 'No pricing version found' });
    const pricing = await SpaceServiceOperations.getPricing('tomatometer', version);
    res.status(200).json({ contract, pricing });
  } catch {
    res.status(500).json({ error: 'Failed to refresh subscription' });
  }
});

// Update user's contract
router.get('/contracts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const contract = await container.spaceClient?.contracts.getContract(userId);
    res.status(200).json({ contract: contract });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Update user's contract
router.put('/contracts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    await container.spaceClient?.contracts.updateContractSubscription(userId, req.body);
    res.status(200).json({ message: 'Contract updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

router.post('/contracts/renew-token', async (req, res) => {
  try {
    const userId = getCurrentUser() ?? testUserId;

    const token = await container.spaceClient?.features.generateUserPricingToken(userId);
    
    res.status(200).json({ pricingToken: token });
  } catch {
    res.status(500).json({ error: 'Failed to renew token' });
  }
});

// Generate a new contract for user with id: userId
router.post('/contracts', async (req, res) => {
  try {
    const userId = getCurrentUser() ?? testUserId;

    const contractData = {
      userContact: {
        userId: userId,
        username: userId + "-username",
      },
      usageLevels: {
        maxPomodoroTimers: 1,
      },
      contractedServices: {
        tomatometer: '1.0.0',
      },
      subscriptionPlans: {
        tomatometer: 'basic',
      },
      subscriptionAddOns: {
        tomatometer: {
          extraTimers: 2,
        },
      },
    }

    const createdContract = await container.spaceClient?.contracts.addContract(contractData);
    res.status(201).json(createdContract);
  }catch (error) {
    res.status(500).json({ error: 'Failed to create contract', details: (error as Error).message });
  }
})

export default router;
