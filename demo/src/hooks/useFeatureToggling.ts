import { useContext } from "react";
import { FeatureTogglingContext } from "../contexts/featureFlagContext";

// Hook para usar el contexto
export const useFeatureToggling = () => {
    const context = useContext(FeatureTogglingContext);
    if (!context) {
      throw new Error('useFeatureToggling must be used within a FeatureTogglingProvider');
    }

    return context;
  };