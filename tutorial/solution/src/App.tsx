import { useEffect, useState } from 'react';
import { SpaceProvider, type SpaceConfiguration } from 'space-react-client';
import { DemoApp } from './apps/demo';
import { SubscriptionProvider } from './contexts/subscriptionContext';
import { SettingsContext, SettingsToggle } from './contexts/settingsContext';
import { PageProvider } from './contexts/pageContext';
import { TimelineProvider } from './contexts/timelineContext';

// SPACE URL and organization API key, read from .env.
const spaceConfig: SpaceConfiguration = {
  url: import.meta.env.VITE_SPACE_URL || 'http://localhost:5403',
  apiKey: import.meta.env.VITE_SPACE_API_KEY || '',
  allowConnectionWithSpace: true,
};

export default function App() {
  const [toggles, setToggles] = useState<SettingsToggle>({
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Motivational quotes': false,
    'Show plan/add-on notifications': true,
  });

  useEffect(() => {
    if (toggles['Dark mode']) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [toggles['Dark mode']]);

  // F1 · Connect the frontend to SPACE
  return (
    <SpaceProvider config={spaceConfig}>
      <TimelineProvider>
        <div className="flex flex-col h-screen w-screen">
          <div className="flex flex-1">
            <PageProvider>
              <SettingsContext.Provider value={{ toggles, setToggles }}>
                <SubscriptionProvider>
                  <DemoApp />
                </SubscriptionProvider>
              </SettingsContext.Provider>
            </PageProvider>
          </div>
        </div>
      </TimelineProvider>
    </SpaceProvider>
  );
}
