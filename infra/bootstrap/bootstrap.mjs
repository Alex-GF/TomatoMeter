import { access, readFile, writeFile } from 'node:fs/promises';

// Each stage includes everything provisioned by the previous ones.
const STAGES = ['empty', 'pricing', 'linked', 'demo'];
const stage = process.env.LAB_STAGE ?? 'demo';
if (!STAGES.includes(stage)) throw new Error(`Unknown LAB_STAGE '${stage}'. Use one of: ${STAGES.join(', ')}`);
const reached = target => STAGES.indexOf(stage) >= STAGES.indexOf(target);

const sphereApi = 'http://sphere-server:8080/api/v1';
const spaceApi = 'http://space-server:3000/api/v1';
const username = 'tomato_demo';
const password = 'tomato-demo';
const spaceOrgName = 'TomatoMeter Lab';
// Mounted only by the tutorial overlay: the starter app the attendees edit.
const tutorialEnvFile = '/tutorial-app/.env';

async function request(url, options = {}, allowed = []) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  if (!response.ok && !allowed.includes(response.status)) throw new Error(`${options.method ?? 'GET'} ${url} failed (${response.status}): ${JSON.stringify(body)}`);
  return { response, body };
}

async function waitFor(url) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* still starting */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

// Keep the attendee's .env in step with the SPACE instance that was just created:
// checkpoint 3 receives the key, earlier checkpoints get an empty one to fill in.
// Returns false when the tutorial app is not mounted (demo).
async function writeTutorialApiKey(apiKey) {
  try { await access('/tutorial-app'); } catch { return false; }
  let content = '';
  try { content = await readFile(tutorialEnvFile, 'utf8'); } catch { /* no .env yet */ }
  const keyLine = `VITE_SPACE_API_KEY=${apiKey}`;
  const keyPattern = /^VITE_SPACE_API_KEY=.*$/m;
  if (keyPattern.test(content)) content = content.replace(keyPattern, keyLine);
  else content = `${content}${content && !content.endsWith('\n') ? '\n' : ''}VITE_SPACE_URL=http://localhost:5403\n${keyLine}\n`;
  await writeFile(tutorialEnvFile, content);
  return true;
}

await waitFor(`${sphereApi}/healthcheck`);
await waitFor(`${spaceApi}/healthcheck`);

// --- SPHERE demo user (every stage) ---------------------------------------
await request(`${sphereApi}/users/register`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ firstName: 'Tomato', lastName: 'Demo', username, email: 'tomato_demo@example.com', password }),
}, [201, 400, 409]);
let sphereLogin;
for (let attempt = 0; attempt < 30; attempt += 1) {
  sphereLogin = await request(`${sphereApi}/users/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ loginField: username, password }),
  }, [403]);
  if (sphereLogin.response.ok) break;
  await new Promise(resolve => setTimeout(resolve, 1000));
}
if (!sphereLogin?.response.ok) throw new Error('SPHERE demo user email verification did not complete');

// The SPACE demo user is created by space-server itself (ADMIN_USER / ADMIN_PASSWORD).
if (!reached('pricing')) {
  await writeTutorialApiKey('');
  console.log(`Laboratory ready (stage: ${stage}): SPHERE and SPACE only contain the ${username} user.`);
  process.exit(0);
}

// --- SPHERE pricing ---------------------------------------------------------
const sphereHeaders = { authorization: `Bearer ${sphereLogin.body.token}` };
const userOrgs = await request(`${sphereApi}/users/me/orgs`, { headers: sphereHeaders });
const sphereOrg = userOrgs.body.items?.find(org => org.name === username) ?? userOrgs.body.find?.(org => org.name === username) ?? userOrgs.body.items?.[0];
if (!sphereOrg) throw new Error('SPHERE did not create the demo personal organization');
const sphereOrgId = sphereOrg.id ?? sphereOrg._id;
const existingPricings = await request(`${sphereApi}/pricings/${sphereOrgId}`, { headers: sphereHeaders });
const pricingItems = existingPricings.body.items ?? existingPricings.body.pricings ?? existingPricings.body;
let pricing = pricingItems?.find?.(item => item.slug === 'tomatometer');
if (!pricing) {
  const form = new FormData();
  form.set('private', 'false');
  form.set('name', 'TomatoMeter');
  form.set('yaml', new Blob([await readFile('/workspace/TomatoMeter.yml')], { type: 'application/yaml' }), 'TomatoMeter.yml');
  const created = await request(`${sphereApi}/pricings/${sphereOrgId}`, { method: 'POST', headers: sphereHeaders, body: form }, [409]);
  pricing = created.response.status === 409
    ? undefined
    : created.body;
}
// The list endpoint returns a version summary. Retrieve the pricing detail so
// SPACE always receives SPHERE's permanent pricing identity (`pricingId`).
if (!pricing?.pricingId) pricing = (await request(
  `${sphereApi}/pricings/${sphereOrgId}/tomatometer`, { headers: sphereHeaders }
)).body;
const pricingId = pricing.pricingId ?? pricing.id ?? pricing._id;
if (!pricingId) throw new Error(`SPHERE did not return a permanent pricing identity: ${JSON.stringify(pricing)}`);

if (!reached('linked')) {
  await writeTutorialApiKey('');
  console.log(`Laboratory ready (stage: ${stage}): SPHERE pricing ${pricingId} is published; SPACE has no services yet.`);
  process.exit(0);
}

// --- SPACE service linked to SPHERE -----------------------------------------
const spaceLogin = await request(`${spaceApi}/users/authenticate`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }),
});
const userKey = spaceLogin.body.apiKey;
const spaceOrgs = await request(`${spaceApi}/organizations`, { headers: { 'x-api-key': userKey } });
const spaceOrg = spaceOrgs.body.data?.find(org => org.name === spaceOrgName);
if (!spaceOrg) throw new Error(`SPACE did not create the '${spaceOrgName}' organization`);
const apiKey = spaceOrg.apiKeys?.find(key => key.scope === 'ALL')?.key;
if (!apiKey) throw new Error('SPACE did not return an ALL-scope organization API key');
const headers = { 'content-type': 'application/json', 'x-api-key': apiKey };
// The same permanent link SPHERE's UI copies; SPACE reaches it through space-sphere-link.
const permanentUrl = `http://localhost:5402/p/${pricingId}`;
const service = await request(`${spaceApi}/services/TomatoMeter`, { headers }, [404]);
if (service.response.status === 404) await request(`${spaceApi}/services`, { method: 'POST', headers, body: JSON.stringify({ source: 'sphere', permanentUrl, policy: 'all_last', pollIntervalMinutes: 1 }) });

if (!reached('demo')) {
  const written = await writeTutorialApiKey(apiKey);
  console.log(`Laboratory ready (stage: ${stage}): SPHERE pricing ${pricingId} is linked to SPACE.${written ? ' API key written to tutorial/tomatometer/.env.' : ''}`);
  process.exit(0);
}

// --- Demo application -------------------------------------------------------
// TomatoMeter asks for an anonymous token before a visitor identifies itself;
// pre-provision both the demo account and that initial visitor contract.
for (const userId of ['test-user-id', 'anonymous']) {
  const contract = await request(`${spaceApi}/contracts/${userId}`, { headers }, [404]);
  if (contract.response.status === 404) await request(`${spaceApi}/contracts`, { method: 'POST', headers, body: JSON.stringify({
    userContact: { userId, username: userId === 'anonymous' ? 'Anonymous visitor' : 'Tomato demo user' },
    billingPeriod: { autoRenew: true, renewalDays: 30 },
    contractedServices: { tomatometer: '1.0.0' }, subscriptionPlans: { tomatometer: 'basic' }, subscriptionAddOns: {},
  }) });
}
await writeFile('/lab/space.json', JSON.stringify({ spaceUrl: 'http://space-nginx:5403', apiKey }, null, 2));
console.log(`Laboratory ready (stage: ${stage}): SPHERE pricing ${pricingId} is linked to SPACE.`);
