import React, { createContext, useState, useEffect } from 'react';
import {
  FeatureTogglingLibrary,
  FeatureTogglingClient,
  FeatureTogglingContextType,
} from '../../types';

import { UnleashClientManager } from '../../proxy/unleash/src/proxy';
import { initializeAdHoc } from '../../proxy/ad-hoc/src/proxy';
import { withDevCycleProvider } from "@devcycle/react-client-sdk";
import { DevCycleClientManager } from '../../proxy/devcycle/src/proxy';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { initializeOpenFeature } from '../../proxy/open-feature/src/proxy';

export const FeatureTogglingContext = createContext<FeatureTogglingContextType | undefined>(
  undefined
);

function FeatureTogglingProvider ({
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
      case 'devcycle':
        // const devCycleClient = useDevCycleClient();
        // console.log(devCycleClient);
        client = await DevCycleClientManager.initializeDevCycle();
        break;
      case 'openFeatureProvider':
        client = initializeOpenFeature();
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
    <FeatureTogglingContext.Provider value={{ isFeatureEnabled, currentLibrary, setLibrary }}>
      <OpenFeatureProvider>
        {children}
      </OpenFeatureProvider>
    </FeatureTogglingContext.Provider>
  ) : (
    <></>
  );
}

export default withDevCycleProvider({
  sdkKey: import.meta.env.VITE_DEVCYCLE_KEY,
}
)(FeatureTogglingProvider);