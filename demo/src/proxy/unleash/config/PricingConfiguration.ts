import { PricingContext } from 'pricing4ts/server';

export class PricingConfiguration extends PricingContext{

    constructor() {
        super();
    }

    getConfigFilePath(): string {
        return "../resources/pricing.yml";
    }
    getJwtSecret(): string {
        return "secret";
    }
    getUserContext(): Record<string, boolean | string | number> {
        return {
            user: "",
            createdExpenses: 2,
        }
    }
    getUserPlan(): string {
        return "FREE";
    }
}