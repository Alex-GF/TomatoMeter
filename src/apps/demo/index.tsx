import { useContext, useState } from 'react';
import Sidebar from '../../components/sidebar';
import PomodoroTimer from '../../pages/pomodoro-timer/pomodoro-timer';
import WeeklyProductivity from '../../pages/weekly-productivity/weekly-productivity';
import Settings, { SettingsContext } from '../../pages/settings/settings';
import Pricing from '../../pages/pricing/pricing';
import { PageProvider, usePage } from '../../contexts/pageContext';
import DailySummaryPage from '../../pages/daily-summary/daily-summary';

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

  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw]">
        <div className="h-[75vh] w-[75vw] max-w-[1500px] overflow-hidden rounded-[25px] bg-white shadow-lg">
          <div className="flex h-full bg-demo-primary">
            <Sidebar />
            <div className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]">
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
