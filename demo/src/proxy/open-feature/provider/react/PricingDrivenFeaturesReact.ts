import {
  ClientProviderStatus,
  Hook,
  JsonValue,
  OpenFeatureEventEmitter,
  Provider,
  ResolutionDetails,
} from '@openfeature/react-sdk';
import { evaluatePricing } from "pricing4react";
import { ExtendedFeatureStatus } from 'pricing4ts';
export class PricingDrivenFeaturesProvider implements Provider {
  readonly metadata = {
    name: 'pricing-driven-features',
    description: 'An Open Feature provider that enables features based on pricing information',
  };

  readonly runsOn = 'client';

  events = new OpenFeatureEventEmitter();
  hooks?: Hook[] | undefined;
  status?: ClientProviderStatus | undefined;

  private pricingUrl: string | undefined;
  private pricingYaml: string | undefined;
  private evaluation: Record<string, ExtendedFeatureStatus> = {};

  resolveBooleanEvaluation(flagKey: string, defaultValue: boolean): ResolutionDetails<boolean> {
    try {
      return {
        value: this._evaluateFeature(flagKey).value.eval as boolean,
      };
    } catch (error) {
      console.error('Error occurred during evaluation. ERROR: ', (error as Error).message);
      return {
        value: defaultValue,
      };
    }
  }

  resolveStringEvaluation(flagKey: string, defaultValue: string): ResolutionDetails<string> {
    try {
      const result = this._evaluateFeature(flagKey);
      return {
        value: result.value.eval.toString(),
      };
    } catch (error) {
      console.error('Error occurred during evaluation. ERROR: ', (error as Error).message);
      return {
        value: defaultValue,
      };
    }
  }

  resolveNumberEvaluation(flagKey: string, defaultValue: number): ResolutionDetails<number> {
    try {
      const result = this._evaluateFeature(flagKey);
      return {
        value: result.value.eval ? 1 : 0,
      };
    } catch (error) {
      console.error('Error occurred during evaluation. ERROR: ', (error as Error).message);
      return {
        value: defaultValue,
      };
    }
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<T> {
    try {
      return this._evaluateFeature(flagKey) as unknown as ResolutionDetails<T>;
    } catch (error) {
      console.error('Error occurred during evaluation. ERROR: ', (error as Error).message);
      return {
        value: defaultValue,
      } as ResolutionDetails<T>;
    }
  }

  initialize?(context?: any): Promise<void> {
    if (context.pricingUrl) {
      this.pricingUrl = context.pricingUrl;
      if (!context.subscription) {
        return Promise.reject(
          "Subscription not provided in context. Use 'subscription' to provide one. It's value must be a list comprised of at least one name of plan/add-on."
        );
      }
      if (!context.userContext) {
        return Promise.reject(
          "User context not provided in context. Use 'userContext' to provide one. It's value must be a JSON object with at least the key 'user', with a string value identifying the user."
        );
      }
      return fetch(this.pricingUrl!)
        .then(response => response.text())
        .then(yaml => {
          this.pricingYaml = yaml;
          this.evaluation = evaluatePricing(
            this.pricingYaml,
            context.subscription,
            context.userContext!
          );
        });
    } else {
      return Promise.reject(
        "Pricing URL not provided in context. Use 'pricingUrl' to provide one."
      );
    }
  }

  private _evaluateFeature(flagKey: string): ResolutionDetails<any> {
    if (Object.keys(this.evaluation).length === 0) {
      return {
        value: {
          eval: false,
          used: null,
          limit: null,
          error: {
            code: 'PROVIDER_NOT_READY',
            message: 'Pricing not yet loaded into the provider',
          },
        },
      };
    } else {
      return {
        value: this.evaluation[flagKey],
      };
    }
  }
}
