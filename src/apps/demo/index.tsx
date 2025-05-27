import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/sidebar';
import PomodoroTimer from '../../pages/pomodoro-timer/pomodoro-timer';
import WeeklyProductivity from '../../pages/weekly-productivity/weekly-productivity';
import DailySummary from '../../pages/daily-summary/daily-summary';
import Settings, { SettingsContext } from '../../pages/settings/settings';
import Pricing from '../../pages/pricing/pricing';

export const SIDEBAR_ITEMS = [
  { name: 'Pomodoro Timer', component: <PomodoroTimer /> },
  { name: 'Daily Summary', component: <DailySummary /> },
  { name: 'Weekly Productivity', component: <WeeklyProductivity/> },
  { name: 'Pricing', component: <Pricing /> },
  { name: 'Settings', component: <Settings /> },
];

export function DemoApp() {
  const [ selectedPage, setSelectedPage ] = useState<string>('Pomodoro Timer');
  const { toggles, setToggles } = useContext(SettingsContext);

  return (
    <SettingsContext.Provider value={{ toggles, setToggles }}>
      <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw]">
        <div className="h-[75vh] w-[75vw] max-w-[1500px] overflow-hidden rounded-[25px] bg-white shadow-lg">
          <div className="flex h-full bg-demo-primary">
            <Sidebar
              setSelectedPage={setSelectedPage}
              selectedPage={selectedPage}
            />
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
