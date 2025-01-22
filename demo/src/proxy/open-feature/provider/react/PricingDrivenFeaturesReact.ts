import { ClientProviderStatus, EvaluationContext, Hook, JsonValue, Logger, OpenFeatureEventEmitter, Provider, ResolutionDetails, TrackingEventDetails } from "@openfeature/react-sdk";

export class PricingDrivenFeaturesProvider implements Provider {
    
    readonly metadata = {
        name: 'pricing-driven-features',
        description: 'A provider that enables features based on pricing information'
    }

    readonly runsOn = "server";

    events = new OpenFeatureEventEmitter();
    hooks?: Hook[] | undefined;
    status?: ClientProviderStatus | undefined;

    onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> | void {
        throw new Error("Method not implemented.");
    }

    resolveBooleanEvaluation(flagKey: string, defaultValue: boolean, context: EvaluationContext, logger: Logger): ResolutionDetails<boolean> {
        throw new Error("Method not implemented.");
    }

    resolveStringEvaluation(flagKey: string, defaultValue: string, context: EvaluationContext, logger: Logger): ResolutionDetails<string> {
        throw new Error("Method not implemented.");
    }

    resolveNumberEvaluation(flagKey: string, defaultValue: number, context: EvaluationContext, logger: Logger): ResolutionDetails<number> {
        throw new Error("Method not implemented.");
    }

    resolveObjectEvaluation<T extends JsonValue>(flagKey: string, defaultValue: T, context: EvaluationContext, logger: Logger): ResolutionDetails<T> {
        throw new Error("Method not implemented.");
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

}