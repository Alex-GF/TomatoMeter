import type { SpaceClient } from 'space-node-client';
import type { Pricing } from '../types';

// Ready-made helpers for SPACE endpoints that space-node-client does not wrap.
// They are not part of the tutorial exercises.

export const SERVICE_NAME = 'tomatometer';

interface ServiceSummary {
  activePricings: Record<string, unknown>;
  sphere?: { target?: { version?: string } };
}

async function spaceGet<T>(client: SpaceClient, path: string): Promise<T | null> {
  const response = await fetch(`${client.httpUrl}${path}`, { headers: { 'x-api-key': client.apiKey } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${path} failed with status ${response.status}`);
  return (await response.json()) as T;
}

export function hasContract(client: SpaceClient, userId: string) {
  return spaceGet<unknown>(client, `/contracts/${userId}`).then(contract => contract !== null);
}

export function getService(client: SpaceClient) {
  return spaceGet<ServiceSummary>(client, `/services/${SERVICE_NAME}`);
}

export async function getPricing(client: SpaceClient, version: string): Promise<Pricing> {
  const pricing = await spaceGet<Pricing>(client, `/services/${SERVICE_NAME}/pricings/${version}`);
  if (!pricing) throw new Error(`SPACE has no TomatoMeter pricing ${version}`);
  return pricing;
}

/** The version SPACE currently serves: the SPHERE target when linked, else the latest active one. */
export function currentVersion(service: ServiceSummary): string | undefined {
  return service.sphere?.target?.version ?? Object.keys(service.activePricings).at(-1);
}
