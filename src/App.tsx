import { useState } from 'react';
import { DemoApp } from './apps/demo';
import { SubscriptionProvider } from './contexts/subscriptionContext';
import { SettingsContext, SettingsToggle } from './pages/settings/settings';

export default function App() {
  const [toggles, setToggles] = useState<SettingsToggle>({
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Advanced productivity analytics': false,
    'Motivational quotes': true,
  });
  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <SubscriptionProvider>
        <DemoApp />
      </SubscriptionProvider>
    </SettingsContext.Provider>
  );
}
