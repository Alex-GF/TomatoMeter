import { DemoApp } from './apps/demo';
import FeatureTogglingProvider from './contexts/featureFlagContext';
import { SubscriptionProvider } from './contexts/subscriptionContext';

export default function App() {
  return (
    <FeatureTogglingProvider initialLibrary="openFeatureProvider">
      <SubscriptionProvider>
        <DemoApp />
      </SubscriptionProvider>
    </FeatureTogglingProvider>
  );
}
