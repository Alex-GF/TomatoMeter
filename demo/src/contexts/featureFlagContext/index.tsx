import React, { createContext, useState, useEffect } from 'react';
import {
  FeatureTogglingLibrary,
  FeatureTogglingClient,
  FeatureTogglingContextType,
} from '../../types';

import { UnleashClientManager } from '../../proxy/unleash/src/proxy';
import { initializeAdHoc } from '../../proxy/ad-hoc/src/proxy';

export const FeatureTogglingContext = createContext<FeatureTogglingContextType | undefined>(
  undefined
);

// // Provider
// interface FeatureTogglingProviderProps {
//   initialLibrary: FeatureTogglingLibrary;
//   children: ReactNode;
// }

export default function FeatureTogglingProvider({
  initialLibrary,
  children,
}: {
  initialLibrary: FeatureTogglingLibrary;
  children: React.ReactNode;
}): JSX.Element {
  const [currentLibrary, setCurrentLibrary] = useState<FeatureTogglingLibrary>(initialLibrary);
  const [clientInstance, setClientInstance] = useState<FeatureTogglingClient | null>(null);

  // Loads the library dynamically
  const loadLibrary = async (libraryName: FeatureTogglingLibrary) => {
    let client: FeatureTogglingClient | null | any = null;

    switch (libraryName) {
      case 'unleash':
        // const { UnleashClientManager } = await import('../../../tools/unleash/src/unleash-proxy');
        client = await UnleashClientManager.initializeUnleash();
        break;
      case 'ad-hoc':
        client = initializeAdHoc();
        break;
      default:
        throw new Error(`Library ${libraryName} is not supported`);
    }

    setClientInstance(client);
  };

  // Loads the initial library
  useEffect(() => {
    loadLibrary(currentLibrary);
  }, [currentLibrary]);

  const isFeatureEnabled = (key: string) => {
    if (!clientInstance) {
      throw new Error('Feature toggling library not loaded');
    }

    return clientInstance?.getFeature(key) || false;
  };

  const setLibrary = (libraryName: FeatureTogglingLibrary) => {
    setCurrentLibrary(libraryName);
  };

  return clientInstance ? (
    <FeatureTogglingContext.Provider value={{ isFeatureEnabled, setLibrary }}>
      {children}
    </FeatureTogglingContext.Provider>
  ) : (
    <></>
  );
}
