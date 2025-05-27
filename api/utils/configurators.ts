import { connect } from 'space-node-client';
import { container } from '../config/container';
import dotenv from 'dotenv';

dotenv.config();

export const testUserId = 'test-user-id';

export function configureSpaceClient() {
  container.spaceClient = connect({
    url: process.env.SPACE_URL || 'http://localhost:5403',
    apiKey: process.env.SPACE_API_KEY || 'your-api-key',
  });

  container.spaceClient.on('synchronized', spaceSynchronizationCallback);
}

async function spaceSynchronizationCallback() {
  console.log('Space client synchronized successfully');

  const serviceExists = await container.spaceClient?.services.getService('TomatoMeter');
  if (serviceExists) {
    console.log('TomatoMeter service and test user contract already exist, skipping creation');
    return;
  }

  await container.spaceClient?.services.addService('./api/resources/TomatoMeter.yml');

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

  console.log('TomatoMeter service and test user contract created successfully');
}
