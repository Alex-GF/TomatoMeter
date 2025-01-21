import { useVariableValue } from "@devcycle/react-client-sdk";

export class DevCycleClientManager {

    static initializeDevCycle(){
        return {
            getFeature: (key: string) => {
                return useVariableValue(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false);
            },
        };
    }
}