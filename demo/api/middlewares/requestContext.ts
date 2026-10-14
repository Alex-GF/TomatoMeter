import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<{ userId: string }>();

export function runWithUser<T>(userId: string, callback: () => T) {
  return asyncLocalStorage.run({ userId }, callback);
}

export function getCurrentUser(): string | undefined {
  const store = asyncLocalStorage.getStore();
  return store?.userId;
}