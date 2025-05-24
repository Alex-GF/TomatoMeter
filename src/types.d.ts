export interface ExpenseItemProps {
  name: string;
  time: string;
  amount: number;
  category: string;
  budget: number;
}

// FeatureTogglingContext

// Type to represent supported libraries
export type FeatureTogglingLibrary = 'unleash' | 'ad-hoc' | 'devcycle' | 'launchDarkly' | 'openFeatureProvider';

// Common interface for all feature toggling solutions
export interface FeatureTogglingClient {
  getFeature: (key: string) => boolean; // Ask for the state of a feature (enabled/disabled)
}

// Provider's context
export interface FeatureTogglingContextType {
  isFeatureEnabled: (key: string) => boolean; // Ask for the state of a feature (enabled/disabled)
  currentLibrary: FeatureTogglingLibrary; // The current library in use
  setLibrary: (libraryName: FeatureFlagLibrary) => void; // Set the library to use
}