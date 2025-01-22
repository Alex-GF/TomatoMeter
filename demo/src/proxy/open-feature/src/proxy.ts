import {
  EvaluationContext,
  InMemoryProvider,
  OpenFeature,
  useBooleanFlagValue,
  useFlag,
} from '@openfeature/react-sdk';
import { PricingDrivenFeaturesProvider } from '../provider/node/PricingDrivenFeaturesProvider';
import { PricingConfiguration } from '../config/PricingConfiguration';

const flagConfig = {
  'expenses': {
    disabled: false,
    variants: {
      on: true,
      off: false,
    },
    defaultVariant: "on",
    contextEvaluator: (context: EvaluationContext) => {
      if (context.silly) {
        return 'on';
      }
      return 'off'
    }
  },
  'expensesCategories': {
    disabled: false,
    variants: {
      on: true,
      off: false,
    },
    defaultVariant: "on",
    contextEvaluator: (context: EvaluationContext) => {
      if (context.silly) {
        return 'on';
      }
      return 'off'
    }
  },
  'expensesGraph': {
    disabled: false,
    variants: {
      on: true,
      off: false,
    },
    defaultVariant: "on",
    contextEvaluator: (context: EvaluationContext) => {
      if (context.silly) {
        return 'on';
      }
      return 'off'
    }
  }
};

export function initializeOpenFeature() {
  OpenFeature.setProvider(new InMemoryProvider(flagConfig));

  return {
    getFeature: (key: string) => {
      console.log('getFeature', key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
      console.log(useBooleanFlagValue(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false))
      console.log(useFlag(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), false))
      return useBooleanFlagValue(key, false);
    },
  };
}
