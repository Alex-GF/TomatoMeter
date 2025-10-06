import { CacheType, connect } from 'space-node-client';
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
    cache: {
      enabled: true,
      ttl: 60 * 60 * 1000, // 1 hour
      type: CacheType.BUILTIN
    }
  });

  container.spaceClient.on('synchronized', spaceSynchronizationCallback);

  container.spaceClient.on('error', (error: Error) => {
    console.log('------- Cannot connect to SPACE -------');
    console.error(error);
    console.log('---------');
    console.log(`User URL: ${process.env.VITE_SPACE_URL || 'http://localhost:5403'}`);
    console.log(`API Key: ${process.env.VITE_SPACE_API_KEY || 'your-api-key'}`);
    console.log('---------');
    console.log(
      'Please check that your .env file information corresponds to the configuration of SPACE.'
    );
  });
}

async function spaceSynchronizationCallback() {
  console.log('Space client synchronized successfully');

  if (!container.spaceClient?.httpUrl) {
    throw new Error('Space client HTTP URL is not defined');
  }

  if (!container.spaceClient?.apiKey) {
    throw new Error('Space client API key is not defined');
  }

  SpaceServiceOperations.setAxiosInstance(
    container.spaceClient.httpUrl,
    container.spaceClient?.apiKey
  );

  try {
    await SpaceServiceOperations.getService('TomatoMeter');
  } catch {
    await SpaceServiceOperations.addService('./api/resources/TomatoMeter.yml');
  }

  try{
    await container.spaceClient.contracts.getContract(testUserId);
    await resetContractUsageLevels();
    console.log("Contract exists, usage levels reset");
  }catch{
    container.spaceClient.contracts.addContract({
      userContact: {
        userId: testUserId,
        username: "testUser",
      },
      billingPeriod: {
        autoRenew: true,
        renewalDays: 30,
      },
      contractedServices: {
        tomatometer: "1.0.0",
      },
      subscriptionPlans: {
        tomatometer: "basic",
      },
      subscriptionAddOns: {},
    });
  }
}

async function resetContractUsageLevels(){
  
  const response = await fetch(`${container.spaceClient!.httpUrl}/contracts/${testUserId}/usageLevels?reset=true`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': container.spaceClient!.apiKey,
    },
  })

  console.log("Usage levels reset");
  
  return response;
}