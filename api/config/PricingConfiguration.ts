import { PricingContext } from 'pricing4ts/server';
import { container } from './container';
import { getCurrentUser } from '../middlewares/requestContext';

export class PricingConfiguration extends PricingContext {
  constructor() {
    super();
  }

  getConfigFilePath(): string {
    return 'api/resources/TomatoMeter.yml';
  }
  getJwtSecret(): string {
    return 'secret';
  }
  getSubscriptionContext(): Record<string, boolean | string | number> {
    const currentUser = getCurrentUser();
    const currentUserContract = container.userContracts.find(
      c => c.userContact.userId === currentUser
    );
    
    return currentUserContract?.usageLevels ?? {};
  }
  getUserPlan(): string {
    const currentUser = getCurrentUser();
    const currentUserContract = container.userContracts.find(
      c => c.userContact.userId === currentUser
    );

    return currentUserContract?.subscriptionPlans.tomatometer ?? "basic";
  }
  getUserAddOns(): string[] {
    const currentUser = getCurrentUser();
    const currentUserContract = container.userContracts.find(
      c => c.userContact.userId === currentUser
    );

    return Object.keys(currentUserContract?.subscriptionAddOns.tomatometer ?? {}).filter(
      key => currentUserContract?.subscriptionAddOns.tomatometer[key] ?? 0 > 0
    );
  }
}
