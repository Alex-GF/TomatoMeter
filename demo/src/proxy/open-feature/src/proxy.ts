import { OpenFeature, useBooleanFlagValue } from '@openfeature/react-sdk';
import { ReactPricingDrivenFeaturesProvider } from 'pricing4react';

export class OpenFeatureClientManager {
  static pricingUrl: string = 'http://sphere.score.us.es/static/pricings/uploadedDataset/Pricing-driven%20Feature%20Toggling%20Demo/2025-1-8.yml';
  static userSubscription: string[] = ['FREE'];
  static userContext: Record<string, any> = {
    user: 'test',
    createdExpenses: 2,
  };

  static initializeOpenFeature() {
    OpenFeature.setProvider(new ReactPricingDrivenFeaturesProvider(), {
      pricingUrl: OpenFeatureClientManager.pricingUrl,
      subscription: OpenFeatureClientManager.userSubscription,
      userContext: OpenFeatureClientManager.userContext,
    });
  
    return {
      getFeature: (key: string) => {
        return useBooleanFlagValue(key, false);
      },
    };
  }
  
  static setUserContext(newUserContext: Record<string, any>) {
    OpenFeatureClientManager.userContext = newUserContext;
    OpenFeature.setContext({
      pricingUrl: OpenFeatureClientManager.pricingUrl,
      subscription: OpenFeatureClientManager.userSubscription,
      userContext: OpenFeatureClientManager.userContext,
    });
  }

  static setSubscription(newSubscription: string[]) {
    OpenFeatureClientManager.userSubscription = newSubscription;
    OpenFeature.setContext({
      pricingUrl: OpenFeatureClientManager.pricingUrl,
      subscription: OpenFeatureClientManager.userSubscription,
      userContext: OpenFeatureClientManager.userContext,
    });
  }
}


