import { Router } from 'express';
import { container } from '../config/container';
import { testUserId } from '../utils/configurators';
import { SpaceServiceOperations } from '../utils/spaceOperations';
import { Pricing } from '../types';
import yaml from 'js-yaml';
import { Readable } from 'stream';

const router = Router();

// Update user's contract
router.get('/contracts', async (req, res) => {
  try {
    const contract = await container.spaceClient?.contracts.getContract(testUserId);
    res.status(200).json({ contract: contract });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

router.get('/contracts/pricing', async (req, res) => {
  try {
    const contract = await container.spaceClient?.contracts.getContract(testUserId);

    const currentPricingVersion = contract?.contractedServices.tomatometer;

    if (!currentPricingVersion) {
      return res.status(404).json({ error: 'No pricing version found' });
    }

    const pricing: Pricing = await SpaceServiceOperations.getPricing(
      'TomatoMeter',
      currentPricingVersion
    );

    res.status(200).json(pricing);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

/**
 * Processes the pricing object to transform the values of features and usageLimits in plans and add-ons,
 * as well as usageLimitsExtensions, into the format { value: ... }.
 */
function processPricing(pricing: Record<string, unknown>) {
  // Process plans
  if (pricing.plans && typeof pricing.plans === 'object') {
    Object.values(pricing.plans as Record<string, unknown>).forEach((plan) => {
      if (typeof plan !== 'object' || !plan) return;
      // Features
      if ('features' in plan && plan.features && typeof plan.features === 'object') {
        const features = plan.features as Record<string, unknown>;
        Object.keys(features).forEach((key) => {
          features[key] = { value: features[key] };
        });
      }
      // Usage limits
      if ('usageLimits' in plan && plan.usageLimits && typeof plan.usageLimits === 'object') {
        const usageLimits = plan.usageLimits as Record<string, unknown>;
        Object.keys(usageLimits).forEach((key) => {
          usageLimits[key] = { value: usageLimits[key] };
        });
      }
    });
  }
  // Process addons
  if (pricing.addOns && typeof pricing.addOns === 'object') {
    Object.values(pricing.addOns as Record<string, unknown>).forEach((addOn) => {
      if (typeof addOn !== 'object' || !addOn) return;
      // Features
      if ('features' in addOn && addOn.features && typeof addOn.features === 'object') {
        const features = addOn.features as Record<string, unknown>;
        Object.keys(features).forEach((key) => {
          features[key] = { value: features[key] };
        });
      }
      // Usage limits
      if ('usageLimits' in addOn && addOn.usageLimits && typeof addOn.usageLimits === 'object') {
        const usageLimits = addOn.usageLimits as Record<string, unknown>;
        Object.keys(usageLimits).forEach((key) => {
          usageLimits[key] = { value: usageLimits[key] };
        });
      }
      // Usage limits extensions
      if ('usageLimitsExtensions' in addOn && addOn.usageLimitsExtensions && typeof addOn.usageLimitsExtensions === 'object') {
        const usageLimitsExtensions = addOn.usageLimitsExtensions as Record<string, unknown>;
        Object.keys(usageLimitsExtensions).forEach((key) => {
          usageLimitsExtensions[key] = { value: usageLimitsExtensions[key] };
        });
      }
    });
  }
  return pricing;
}

router.post('/contracts/pricing', async (req, res) => {
  try {
    let submittedPricing = req.body;
    submittedPricing = processPricing(submittedPricing);
    submittedPricing.saasName = 'TomatoMeter';
    submittedPricing.syntaxVersion = '3.0';
    const [major, minor, patch] = submittedPricing.version.split('.').map(Number);
    submittedPricing.version = `${major}.${minor + 1}.${patch}`;

    const yamlStr = yaml.dump(submittedPricing, {
      noRefs: true, // avoid alias (&/<<)
      skipInvalid: true, // ignore functions or symbols not serializable
      lineWidth: -1, // do not cut lines
    });

    const stream = Readable.from([yamlStr]);

    await SpaceServiceOperations.addPricing('tomatometer', undefined, stream);

    

    res.status(200).json({ message: 'Pricing received successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit pricing', details: (error as Error).message });
  }
});

// Update user's contract
router.put('/contracts', async (req, res) => {
  try {
    await container.spaceClient?.contracts.updateContractSubscription(testUserId, req.body);
    res.status(200).json({ message: 'Contract updated successfully' });
  } catch {
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
});

export default router;
