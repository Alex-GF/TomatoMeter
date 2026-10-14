import { Router } from 'express';
import { USER_ID } from '../constants';
import { getSpaceClient } from '../space/client';
import { getPricing, SERVICE_NAME } from '../space/services';

// Ready-made: feeds the Pricing page and the sidebar with the user's contract and
// the pricing it is bound to. It starts working as soon as TODO B1 is done.

const router = Router();

const notConnected = { connected: false, error: 'TomatoMeter is not connected to SPACE yet (TODO B1).' };

router.get('/subscription', async (req, res) => {
  const client = getSpaceClient();
  if (!client) return res.status(503).json(notConnected);
  try {
    const contract = await client.contracts.getContract(USER_ID);
    const pricing = await getPricing(client, contract.contractedServices[SERVICE_NAME]);
    res.status(200).json({ connected: true, contract, pricing });
  } catch (error) {
    // Typically: the TomatoMeter service or the demo contract does not exist in SPACE yet.
    res.status(404).json({ connected: true, error: (error as Error).message });
  }
});

// Change the plan and add-ons of the demo user (from the Pricing page).
router.put('/subscription', async (req, res) => {
  const client = getSpaceClient();
  if (!client) return res.status(503).json(notConnected);
  try {
    const { plan, addOns } = req.body as { plan: string; addOns: Record<string, number> };
    const current = await client.contracts.getContract(USER_ID);
    const contract = await client.contracts.updateContractSubscription(USER_ID, {
      contractedServices: { [SERVICE_NAME]: current.contractedServices[SERVICE_NAME] },
      subscriptionPlans: { [SERVICE_NAME]: plan },
      subscriptionAddOns: { [SERVICE_NAME]: addOns ?? {} },
    });
    res.status(200).json({ contract });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
