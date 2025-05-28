import { connect } from 'space-node-client';
import { container } from '../config/container';
import dotenv from 'dotenv';

dotenv.config();

export const testUserId = 'test-user-id';

export function configureSpaceClient() {
  container.spaceClient = connect({
    url: process.env.SPACE_URL || 'http://localhost:5403',
    apiKey: process.env.SPACE_API_KEY || 'your-api-key',
    timeout: 5000,
  });

  container.spaceClient.on('synchronized', spaceSynchronizationCallback);
  container.spaceClient.on('pricing_created', pricingCreatedCallback);
}

async function spaceSynchronizationCallback() {
  console.log('Space client synchronized successfully');

  try {
    await container.spaceClient?.services.getService('TomatoMeter');

    console.log('TomatoMeter service and test user contract already exist, skipping creation');
  } catch (_) {
    await container.spaceClient?.services.addService('./api/resources/TomatoMeter.yml');

    console.log('TomatoMeter service and test user contract created successfully');
  }
}

async function pricingCreatedCallback(data: { serviceName: string; pricingVersion: any }) {
  const pricing = await container.spaceClient?.services.getPricing(
    data.serviceName,
    data.pricingVersion
  );

  container.spaceClient?.contracts
    .getContract(testUserId)
    .then(async _ => {
      await container.spaceClient?.contracts.updateContractSubscription(testUserId, {
        contractedServices: {
          tomatometer: data.pricingVersion,
        },
        subscriptionPlans: {
          tomatometer: Object.keys(pricing?.plans)[0],
        },
        subscriptionAddOns: {},
      });
    })
    .catch(async _ => {
      await container.spaceClient?.contracts.addContract({
        userContact: {
          userId: testUserId,
          username: 'Test User',
        },
        contractedServices: {
          tomatometer: '1.0.0',
        },
        subscriptionPlans: {
          tomatometer: 'BASIC',
        },
        subscriptionAddOns: {},
      });
    });
}
