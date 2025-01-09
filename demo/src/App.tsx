import { DemoApp } from "./apps/demo";
import FeatureTogglingProvider from "./contexts/featureFlagContext";

export default function App() {
  return (
    <FeatureTogglingProvider initialLibrary="ad-hoc">
      <DemoApp />
    </FeatureTogglingProvider>
  );
}
