// SPACE signs pricing tokens with ES256, so it refuses to start without an EC P-256
// private key. The lab makes a throwaway one that never leaves its Docker volume.
import { generateKeyPairSync } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';

const file = '/keys/pricing-token-key.pem';

if (!existsSync(file)) {
  const { privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  // World-readable on purpose: SPACE runs as the unprivileged `node` user.
  writeFileSync(file, privateKey, { mode: 0o644 });
}
