import { ClientProviderStatus, EvaluationContext, Hook, JsonValue, Logger, OpenFeatureEventEmitter, Provider, ResolutionDetails, TrackingEventDetails } from "@openfeature/react-sdk";
import { PricingContext, PricingContextManager, evaluateFeature } from "pricing4ts/server";

export class PricingDrivenFeaturesProvider implements Provider {
    
    readonly metadata = {
        name: 'pricing-driven-features',
        description: 'A provider that enables features based on pricing information'
    }

    readonly runsOn = "server";

    events = new OpenFeatureEventEmitter();
    hooks?: Hook[] | undefined;
    status?: ClientProviderStatus | undefined;

    constructor(pricingContext: PricingContext) {
        PricingContextManager.registerContext(pricingContext);
    }

    onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> | void {
        throw new Error("Method not implemented.");
    }

    resolveBooleanEvaluation(flagKey: string, defaultValue: boolean, context: EvaluationContext, logger: Logger): ResolutionDetails<boolean> {
        return {
            value: this._evaluateFeature(flagKey).value.eval as boolean
        }
    }

    resolveStringEvaluation(flagKey: string, defaultValue: string, context: EvaluationContext, logger: Logger): ResolutionDetails<string> {
        const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;
        
        return {
            value: result.toString()
        };
    }

    resolveNumberEvaluation(flagKey: string, defaultValue: number, context: EvaluationContext, logger: Logger): ResolutionDetails<number> {
        const result: boolean = this._evaluateFeature(flagKey).value.eval as boolean;
        
        return {
            value: result ? 1 : 0
        }
    }

    resolveObjectEvaluation<T extends JsonValue>(flagKey: string, defaultValue: T, context: EvaluationContext, logger: Logger): ResolutionDetails<T> {
        return this._evaluateFeature(flagKey) as unknown as ResolutionDetails<T>;
    }
    
    onClose?(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    initialize?(context?: EvaluationContext): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    track?(trackingEventName: string, context: EvaluationContext, trackingEventDetails: TrackingEventDetails): void {
        throw new Error("Method not implemented.");
    }

    _evaluateFeature(flagKey: string): ResolutionDetails<any>{
        const result = evaluateFeature(flagKey);
        return {
            value: result as any
        };
    }

}