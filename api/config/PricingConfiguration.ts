import { PricingContext } from 'pricing4ts/server';

export class PricingConfiguration extends PricingContext{

    private userPlan: string = "FREE";
    private userContext: Record<string, boolean | string | number> = {
        user: "test",
        createdExpenses: 2,
    }

    constructor() {
        super();
    }

    getConfigFilePath(): string {
        return "api/resources/pricing.yml";
    }
    getJwtSecret(): string {
        return "secret";
    }
    getUserContext(): Record<string, boolean | string | number> {
        return this.userContext;
    }
    getUserPlan(): string {
        return this.userPlan;
    }

    setUserPlan(userPlan: string): void {
        this.userPlan = userPlan;
    }

    setUserContext(userContext: Record<string, boolean | string | number>): void {
        this.userContext = userContext;
    }
}