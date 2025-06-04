import { useContext, useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import PomodoroTimer from '../../pages/pomodoro-timer/pomodoro-timer';
import WeeklyProductivity from '../../pages/weekly-productivity/weekly-productivity';
import { SettingsContext } from '../../contexts/settingsContext';
import Pricing from '../../pages/pricing/pricing';
import { usePage } from '../../contexts/pageContext';
import DailySummaryPage from '../../pages/daily-summary/daily-summary';
import Settings from '../../pages/settings/settings';
import axios from '../../lib/axios';
import { usePricingToken, useSpaceClient } from 'space-react-client';
import { renewToken } from '../../utils/helpers';

export const SIDEBAR_ITEMS = [
  { name: 'Pomodoro Timer', component: <PomodoroTimer /> },
  { name: 'Daily Summary', component: <DailySummaryPage /> },
  { name: 'Weekly Productivity', component: <WeeklyProductivity /> },
  { name: 'Pricing', component: <Pricing /> },
  { name: 'Settings', component: <Settings /> },
];

export function DemoApp() {
  const { toggles, setToggles } = useContext(SettingsContext);
  const { selectedPage } = usePage();
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const spaceClient = useSpaceClient();
  const tokenService = usePricingToken();

  useEffect(() => {
    renewToken(tokenService);

    spaceClient.on(
      'pricing_created',
      async (data: { serviceName: string; pricingVersion: string }) => {
        console.log('Pricing created:', data);
        axios
          .put('/contracts', {
            contractedServices: {
              tomatometer: data.pricingVersion || '1.0.0',
            },
            subscriptionPlans: {
              tomatometer: 'BASIC',
            },
            subscriptionAddOns: {},
          })
          .then(() => {
            renewToken(tokenService).then(() => {
              setReloadTrigger(prev => prev + 1);
            });
          });
      }
    );

    spaceClient.on('pricing_archived', async () => {
      console.log('Pricing archived');
      await renewToken(tokenService);
      setReloadTrigger(prev => prev + 1);
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw] relative">
        <div className="h-[75vh] w-[75vw] max-w-[1500px] overflow-hidden rounded-[25px] bg-white shadow-lg">
          <div className="flex h-full bg-demo-primary">
            <Sidebar />
            <div
              key={reloadTrigger}
              className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]"
            >
              <div className={`flex h-full w-full items-center justify-center bg-white`}>
                <div className="w-full h-full overflow-y-auto">
                  {SIDEBAR_ITEMS.find(item => item.name === selectedPage)!.component}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SettingsContext.Provider>
  );
}
