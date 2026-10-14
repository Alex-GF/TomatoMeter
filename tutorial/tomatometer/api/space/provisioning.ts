import type { SpaceClient } from 'space-node-client';
import { USER_ID } from '../constants';
import { currentVersion, getPricing, getService, hasContract, SERVICE_NAME } from './services';

// Ready-made: not part of the tutorial exercises.
//
// SPACE can only evaluate features for users that have a contract. Once the
// TomatoMeter service exists in SPACE (you create it during the tutorial), this
// subscribes the demo user to the cheapest plan of the active pricing.

const RETRY_MS = 5000;
let provisioning = false;

export async function onSpaceReady(client: SpaceClient): Promise<void> {
  if (provisioning) return;
  provisioning = true;
  let warned = false;
  try {
    for (;;) {
      try {
        if (await ensureContract(client)) return;
        if (!warned) console.log(`Waiting for the TomatoMeter service in SPACE (checking every ${RETRY_MS / 1000}s)...`);
        warned = true;
      } catch (error) {
        console.error('Unable to provision the demo contract in SPACE:', (error as Error).message);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_MS));
    }
  } finally {
    provisioning = false;
  }
}

/** Returns false while the TomatoMeter service does not exist in SPACE yet. */
async function ensureContract(client: SpaceClient): Promise<boolean> {
  const service = await getService(client);
  const version = service && currentVersion(service);
  if (!version) return false;

  if (await hasContract(client, USER_ID)) {
    console.log(`SPACE ready: contract for '${USER_ID}' found.`);
    return true;
  }

  const pricing = await getPricing(client, version);
  const plans = Object.entries(pricing.plans ?? {});
  if (plans.length === 0) throw new Error(`TomatoMeter pricing ${version} has no plans`);
  const [cheapestPlan] = plans.sort(([, a], [, b]) => Number(a.price) - Number(b.price))[0];

  await client.contracts.addContract({
    userContact: { userId: USER_ID, username: 'Tomato demo user' },
    billingPeriod: { autoRenew: true, renewalDays: 30 },
    contractedServices: { [SERVICE_NAME]: version },
    subscriptionPlans: { [SERVICE_NAME]: cheapestPlan },
    subscriptionAddOns: {},
  });
  console.log(`SPACE ready: '${USER_ID}' subscribed to the '${cheapestPlan}' plan of TomatoMeter ${version}.`);
  return true;
}
