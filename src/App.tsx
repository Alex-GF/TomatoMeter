import { DemoApp } from './apps/demo';
import { SubscriptionProvider } from './contexts/subscriptionContext';

export default function App() {
  return (
    
      <SubscriptionProvider>
        <DemoApp />
      </SubscriptionProvider>
    
  );
}
