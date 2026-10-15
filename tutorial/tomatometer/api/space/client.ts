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

  // ---------------------------------------------------------------------------
  // TODO B1 · Connect the backend to SPACE
  //
  // 1. Create the client with `connect({ url, apiKey })` from 'space-node-client',
  //    using SPACE_URL and SPACE_API_KEY, and store it in `spaceClient`.
  // 2. When the client emits the 'synchronized' event (you can track it using `client.on('synchronized', callback)`), call `onSpaceReady(spaceClient)`.
  //    It is already implemented: it gives the demo user a contract in SPACE.
  // ---------------------------------------------------------------------------
}
