import { connect } from 'space-node-client';
import { container } from '../config/container';
import dotenv from 'dotenv';
import { SpaceServiceOperations } from './spaceOperations';

dotenv.config();

export const testUserId = 'test-user-id';

export function configureSpaceClient() {
  container.spaceClient = connect({
    url: process.env.VITE_SPACE_URL || 'http://localhost:5403',
    apiKey: process.env.VITE_SPACE_API_KEY || 'your-api-key',
    timeout: 5000,
  });

  container.spaceClient.on('synchronized', spaceSynchronizationCallback);
  container.spaceClient.on('pricing_created', pricingCreatedCallback);
  container.spaceClient.on('error', (error: Error) => {
    console.log('------- Cannot connect to SPACE -------');
    console.error(error);
    console.log("---------");
    console.log(`User URL: ${process.env.VITE_SPACE_URL || 'http://localhost:5403'}`);
    console.log(`API Key: ${process.env.VITE_SPACE_API_KEY || 'your-api-key'}`);
    console.log("---------");
    console.log('Please check that your .env file information corresponds to the configuration of SPACE.');
  });
}

async function spaceSynchronizationCallback() {
  console.log('Space client synchronized successfully');

  SpaceServiceOperations.setAxiosInstance(
    container.spaceClient?.httpUrl!,
    container.spaceClient?.apiKey!
  );

  try {
    await SpaceServiceOperations.getService('TomatoMeter');

    console.log('TomatoMeter service and test user contract already exist, skipping creation');
  } catch (_) {
    await SpaceServiceOperations.addService('./api/resources/TomatoMeter.yml');

    console.log('TomatoMeter service and test user contract created successfully');
  }
}

async function pricingCreatedCallback(data: { serviceName: string; pricingVersion: any }) {
  const pricing = await SpaceServiceOperations.getPricing(
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
          tomatometer: Object.keys(pricing?.plans!)[0],
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
