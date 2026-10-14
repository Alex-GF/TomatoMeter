import assert from 'node:assert/strict';
import { test } from 'node:test';
import { synchronizeSubscription } from '../src/utils/subscriptionSynchronization';

const tick = () => new Promise(resolve => setImmediate(resolve));
function setup(read = async () => ({ plan: 'premium', addons: { exportAsJson: 1 }, version: '1.0.0' })) {
  const listeners = new Map<string, Set<(data?: any) => void>>();
  const client = {
    on(event: string, fn: (data?: any) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
    },
    off(event: string, fn: (data?: any) => void) { listeners.get(event)?.delete(fn); },
  };
  const browserWindow = new EventTarget();
  const browserDocument = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
  const snapshots: any[] = [];
  const errors: unknown[] = [];
  let reads = 0;
  const stop = synchronizeSubscription({ client, browserWindow, browserDocument,
    read: () => { reads++; return read(); }, apply: snapshot => snapshots.push(snapshot), onError: error => errors.push(error) });
  return { stop, snapshots, errors, browserWindow, browserDocument,
    reads: () => reads, listeners,
    emit: (event: string, data?: any) => listeners.get(event)?.forEach(fn => fn(data)) };
}

test('activation displays the migrated basic subscription without add-ons', async () => {
  let state = { plan: 'premium', addons: { exportAsJson: 1 } as Record<string, number>, version: '1.0.0' };
  const s = setup(async () => state); await tick();
  state = { plan: 'basic', addons: {}, version: '1.1.0' };
  s.emit('pricing_actived', { serviceName: 'TomatoMeter' }); await tick();
  assert.deepEqual(s.snapshots.at(-1), state); s.stop();
});
test('activation preserves the subscription returned by SPACE and updates same-plan pricing versions', async () => {
  let state = { plan: 'premium', addons: { exportAsJson: 2 }, version: '1.0.0' };
  const s = setup(async () => state); await tick();
  state = { ...state, version: '1.1.0' };
  s.emit('pricing_actived', { serviceName: 'tomatometer' }); await tick();
  assert.deepEqual(s.snapshots.at(-1), state); s.stop();
});
test('ignores changes to other services', async () => {
  const s = setup(); await tick();
  s.emit('pricing_actived', { serviceName: 'another-service' }); await tick();
  assert.equal(s.reads(), 1); s.stop();
});
test('reconnection, focus, returning to the tab and coming online re-read SPACE', async () => {
  const s = setup(); await tick();
  s.emit('synchronized'); await tick();
  s.browserWindow.dispatchEvent(new Event('focus')); await tick();
  s.browserDocument.visibilityState = 'hidden';
  s.browserDocument.dispatchEvent(new Event('visibilitychange')); await tick();
  assert.equal(s.reads(), 3);
  s.browserDocument.visibilityState = 'visible';
  s.browserDocument.dispatchEvent(new Event('visibilitychange')); await tick();
  s.browserWindow.dispatchEvent(new Event('online')); await tick();
  assert.equal(s.reads(), 5); s.stop();
});
test('coalesces overlapping events and discards the stale in-flight response', async () => {
  const resolvers: Array<(value: any) => void> = [];
  const s = setup(() => new Promise(resolve => resolvers.push(resolve)));
  s.emit('pricing_actived', { serviceName: 'tomatometer' });
  s.emit('synchronized');
  assert.equal(s.reads(), 1);
  resolvers.shift()!({ plan: 'premium' }); await tick();
  assert.equal(s.snapshots.length, 0); assert.equal(s.reads(), 2);
  resolvers.shift()!({ plan: 'basic', addons: {}, version: '1.1.0' }); await tick();
  assert.equal(s.snapshots.at(-1).plan, 'basic'); s.stop();
});
test('failed refresh preserves the last subscription and retries on reconnect', async () => {
  let fail = false;
  const s = setup(async () => { if (fail) throw Error('offline'); return { plan: 'premium', addons: { exportAsJson: 1 }, version: '1.0.0' }; });
  await tick(); fail = true; s.emit('synchronized'); await tick();
  assert.equal(s.snapshots.length, 1); assert.equal(s.errors.length, 1);
  fail = false; s.emit('synchronized'); await tick();
  assert.equal(s.snapshots.length, 2); s.stop();
});
test('cleanup removes listeners and ignores pending responses', async () => {
  let resolve!: (value: any) => void;
  const s = setup(() => new Promise(done => { resolve = done; }));
  s.stop(); resolve({ plan: 'basic' }); await tick();
  s.emit('synchronized'); s.browserWindow.dispatchEvent(new Event('focus'));
  await tick(); assert.equal(s.reads(), 1); assert.equal(s.snapshots.length, 0);
  assert.ok([...s.listeners.values()].every(listeners => listeners.size === 0));
});
