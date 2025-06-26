import { PricingContext } from 'pricing4ts/server';

export class PricingConfiguration extends PricingContext{

    private userPlan: string = "basic";
    private userContext: Record<string, boolean | string | number> = {
        user: "test",
        maxPomodoroTimers: 1,
    }

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