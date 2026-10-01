import type { SpaceClient } from 'space-react-client';

type Options<T> = {
  client: Pick<SpaceClient, 'on' | 'off'>;
  browserWindow: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  browserDocument: Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>;
  read: () => Promise<T>;
  apply: (snapshot: T) => void;
  onError: (error: unknown) => void;
};

// Events are notifications to re-read SPACE, never instructions to change a contract.
export function synchronizeSubscription<T>({ client, browserWindow, browserDocument, read, apply, onError }: Options<T>) {
  let disposed = false;
  let running = false;
  let requested = false;

  const refresh = async () => {
    if (disposed) return;
    requested = true;
    if (running) return;
    running = true;
    try {
      while (requested && !disposed) {
        requested = false;
        try {
          const snapshot = await read();
          // A newer event arrived during this read: fetch again before applying.
          if (!disposed && !requested) apply(snapshot);
        } catch (error) {
          if (!disposed) onError(error);
        }
      }
    } finally {
      running = false;
    }
  };
  const onPricing = (data: { serviceName?: string }) => {
    if (data?.serviceName?.toLowerCase() === 'tomatometer') void refresh();
  };
  const onReconnect = () => { void refresh(); };
  const onVisible = () => {
    if (browserDocument.visibilityState === 'visible') void refresh();
  };

  client.on('pricing_actived', onPricing);
  client.on('pricing_created', onPricing);
  client.on('pricing_archived', onPricing);
  client.on('synchronized', onReconnect);
  browserWindow.addEventListener('focus', onVisible);
  browserWindow.addEventListener('online', onVisible);
  browserDocument.addEventListener('visibilitychange', onVisible);
  void refresh();

  return () => {
    disposed = true;
    client.off('pricing_actived', onPricing);
    client.off('pricing_created', onPricing);
    client.off('pricing_archived', onPricing);
    client.off('synchronized', onReconnect);
    browserWindow.removeEventListener('focus', onVisible);
    browserWindow.removeEventListener('online', onVisible);
    browserDocument.removeEventListener('visibilitychange', onVisible);
  };
}
