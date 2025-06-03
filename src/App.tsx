import { useEffect, useState } from 'react';
import { DemoApp } from './apps/demo';
import { SubscriptionProvider } from './contexts/subscriptionContext';
import { SettingsContext, SettingsToggle } from './contexts/settingsContext';
import { PageProvider } from './contexts/pageContext';
import { type SpaceConfiguration } from 'space-react-client';
import { SpaceProvider } from 'space-react-client';

export default function App() {
  const [toggles, setToggles] = useState<SettingsToggle>({
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Motivational quotes': false,
  });

  const spaceConfig: SpaceConfiguration = {
    url: import.meta.env.VITE_SPACE_URL || 'http://localhost:5403',
    apiKey: import.meta.env.VITE_SPACE_API_KEY || 'your-api-key',
    allowConnectionWithSpace: true,
  };

  useEffect(() => {
    if (toggles['Dark mode']) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [toggles['Dark mode']]);
  
  return (
    <SpaceProvider config={spaceConfig}>
      <PageProvider>
        <SettingsContext.Provider value={{ toggles, setToggles }}>
          <SubscriptionProvider>
            <DemoApp />
          </SubscriptionProvider>
        </SettingsContext.Provider>
      </PageProvider>
    </SpaceProvider>
  );
}
