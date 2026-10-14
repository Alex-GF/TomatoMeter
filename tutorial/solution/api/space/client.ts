import dotenv from 'dotenv';
import { connect, type SpaceClient } from 'space-node-client';
import { onSpaceReady } from './provisioning';

dotenv.config();

// Inside the lab, Docker sets SPACE_URL to SPACE's address on the lab network.
const SPACE_URL = process.env.SPACE_URL ?? 'http://localhost:5403';
// The same organization API key the frontend uses (copy it from the SPACE UI into .env).
const SPACE_API_KEY = process.env.VITE_SPACE_API_KEY;

let spaceClient: SpaceClient | null = null;

/** The SPACE client, or null while TomatoMeter is not connected to SPACE. */
export function getSpaceClient(): SpaceClient | null {
  return spaceClient;
}

export function connectToSpace(): void {
  if (!SPACE_API_KEY) {
    console.warn('SPACE is not configured: set VITE_SPACE_API_KEY in .env (copy it from http://localhost:5403).');
    return;
  }

  // B1 · Connect the backend to SPACE
  const client = connect({ url: SPACE_URL, apiKey: SPACE_API_KEY });
  spaceClient = client;
  client.on('synchronized', () => onSpaceReady(client));
}
