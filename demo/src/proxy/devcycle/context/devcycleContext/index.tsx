import { DevCycleClient, useDevCycleClient } from "@devcycle/react-client-sdk";
import { createContext, useContext, useEffect, useState } from "react";
import { FeatureTogglingContext } from "../../../../contexts/featureFlagContext";

interface DevCycleContextInterface {
    devCycleClient: DevCycleClient | null;
}

export const DevCycleContext = createContext<DevCycleContextInterface | undefined>(undefined);

export default function DevCycleProvider({ children }: {children: React.ReactNode}): JSX.Element {
    
    const [devCycleClient, setDevCycleClient] = useState<DevCycleClient | null>(null);
    
    const featureTogglingContext = useContext(FeatureTogglingContext);

    useEffect(() => {
        if (featureTogglingContext?.currentLibrary === 'devcycle') {
            const devClient = useDevCycleClient();
            setDevCycleClient(devClient);
        }
    }, []);

    return (
        <DevCycleContext.Provider value={{devCycleClient}}>
            {children}
        </DevCycleContext.Provider>
    );
}