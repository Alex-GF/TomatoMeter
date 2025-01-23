import {
  EvaluationContext,
  Hook,
  JsonValue,
  Logger,
  OpenFeatureEventEmitter,
  Provider,
  ResolutionDetails,
  TrackingEventDetails,
} from '@openfeature/server-sdk';
import { PricingContext, PricingContextManager, evaluateFeature } from 'pricing4ts/server';

export class PricingDrivenFeaturesProvider implements Provider {
  readonly metadata = {
    name: 'pricing-driven-features',
    description: 'A provider that enables features based on pricing information',
  };

  readonly runsOn = 'server';

  events = new OpenFeatureEventEmitter();
  hooks?: Hook[] | undefined;

  constructor(pricingContext: PricingContext) {
    PricingContextManager.registerContext(pricingContext);
  }

  onContextChange?(
    oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> | void {
    console.log('Context changed');
    console.log('Old context:', oldContext);
    console.log('New context:', newContext);
    return Promise.resolve();
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<boolean>> {
    console.log('Entra');
    console.log('Result:', this._evaluateFeature(flagKey).value.eval);
    console.log('Resolve Object', this._evaluateFeature(flagKey));

    return Promise.resolve({
      value: this._evaluateFeature(flagKey).value.eval as boolean,
    });
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<string>> {
    const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;

    return Promise.resolve({
      value: result.toString(),
    });
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<number>> {
    const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;

    return Promise.resolve({
      value: result ? 1 : 0,
    });
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<T>> {
    return Promise.resolve(this._evaluateFeature(flagKey) as unknown as ResolutionDetails<T>);
  }

  onClose?(): Promise<void> {
    return Promise.resolve();
  }

  initialize?(context?: EvaluationContext): Promise<void> {
    return Promise.resolve();
  }

  track?(
    trackingEventName: string,
    context: EvaluationContext,
    trackingEventDetails: TrackingEventDetails
  ): void {
    console.log(`Tracking event: ${trackingEventName}`);
  }

  _evaluateFeature(flagKey: string): ResolutionDetails<any> {
    const result = evaluateFeature(flagKey);
    return {
      value: result as any,
    };
  }
}
