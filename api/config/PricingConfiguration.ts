import { PricingContext } from 'pricing4ts/server';
import { container } from './container';

export class PricingConfiguration extends PricingContext{
    constructor() {
        super();
    }

    getConfigFilePath(): string {
        return "api/resources/TomatoMeter.yml";
    }
    getJwtSecret(): string {
        return "secret";
    }
    getSubscriptionContext(): Record<string, boolean | string | number> {
        return container.userContract.usageLevels;
    }
    getUserPlan(): string {
        return container.userContract.subscriptionPlans.tomatometer;
    }
    getUserAddOns(): string[] {
        return Object.keys(container.userContract.subscriptionAddOns.tomatometer).filter(key => container.userContract.subscriptionAddOns.tomatometer[key] > 0);
    }
}