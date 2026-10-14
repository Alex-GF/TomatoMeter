import { readFile, writeFile } from 'node:fs/promises';

const sphereApi = 'http://sphere-server:8080/api/v1';
const spaceApi = 'http://space-server:3000/api/v1';
const username = 'tomato_demo';
const password = 'tomato-demo';

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

await waitFor(`${sphereApi}/healthcheck`);
await waitFor(`${spaceApi}/healthcheck`);

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

const spaceLogin = await request(`${spaceApi}/users/authenticate`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }),
});
const userKey = spaceLogin.body.apiKey;
const spaceOrgs = await request(`${spaceApi}/organizations`, { headers: { 'x-api-key': userKey } });
let spaceOrg = spaceOrgs.body.data?.find(org => org.name === 'tomatometer-lab');
if (!spaceOrg) spaceOrg = (await request(`${spaceApi}/organizations`, {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': userKey }, body: JSON.stringify({ name: 'tomatometer-lab', owner: username }),
})).body;
const apiKey = spaceOrg.apiKeys?.find(key => key.scope === 'ALL')?.key;
if (!apiKey) throw new Error('SPACE did not return an ALL-scope organization API key');
const headers = { 'content-type': 'application/json', 'x-api-key': apiKey };
// Keep provisioning on the service network.  The browser UI remains available
// through sphere-nginx on localhost:5402, but it is not a bootstrap dependency.
const permanentUrl = `http://sphere-server:8080/p/${pricingId}`;
const service = await request(`${spaceApi}/services/TomatoMeter`, { headers }, [404]);
if (service.response.status === 404) await request(`${spaceApi}/services`, { method: 'POST', headers, body: JSON.stringify({ source: 'sphere', permanentUrl, policy: 'all_last', pollIntervalMinutes: 1 }) });
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
console.log(`Laboratory ready: SPHERE pricing ${pricingId} is linked to SPACE.`);
