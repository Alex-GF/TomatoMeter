import { OpenFeature, useBooleanFlagValue, useFlag } from '@openfeature/react-sdk';
import { PricingDrivenFeaturesProvider } from '../provider/react/PricingDrivenFeaturesReact';

export function initializeOpenFeature() {
  OpenFeature.setProvider(new PricingDrivenFeaturesProvider(), {
    pricingUrl:
      'http://sphere.score.us.es/static/pricings/uploadedDataset/Pricing-driven%20Feature%20Toggling%20Demo/2025-1-8.yml',
    userContext: {
      user: 'test',
      maxExpenses: 2,
    },
  });

  return {
    getFeature: (key: string) => {
      console.log('getFeature', key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
      console.log(
        useBooleanFlagValue(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false)
      );
      console.log(useFlag(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false));
      return useBooleanFlagValue(key, false);
    },
  };
}
