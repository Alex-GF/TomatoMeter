import { useEffect, useState } from 'react';
import { DemoApp } from './apps/demo';
import { SubscriptionProvider } from './contexts/subscriptionContext';
import { SettingsContext, SettingsToggle } from './pages/settings/settings';
import { PageProvider } from './contexts/pageContext';

export default function App() {
  const [toggles, setToggles] = useState<SettingsToggle>({
    'Enable sound notifications': true,
    'Dark mode': false,
    'Custom pomodoro duration': false,
    'Motivational quotes': true,
  });

  useEffect(() => {
    if (toggles['Dark mode']) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [toggles['Dark mode']]);

  return (
    <PageProvider>
      <SettingsContext.Provider value={{ toggles, setToggles }}>
        <SubscriptionProvider>
          <DemoApp />
        </SubscriptionProvider>
      </SettingsContext.Provider>
    </PageProvider>
  );
}
