import { useState } from 'react';
import ExpensesPage from '../../pages/expenses';
import Sidebar from '../../components/sidebar';
import PomodoroTimer from '../../pages/pomodoro-timer/pomodoro-timer';

export function DemoApp() {
  const SIDEBAR_ITEMS = [
    { name: 'Pomodoro Timer', component: <PomodoroTimer /> },
    { name: 'Daily Summary', component: <div>Daily Summary</div> },
    { name: 'Weekly Productivity', component: <ExpensesPage /> },
    { name: 'Pricing', component: <div>Pricing</div> },
    { name: 'Settings', component: <div>Settings</div> },
  ];

  const [currentSubscription, setCurrentSubscription] = useState<string[]>(['FREE']);
  const [selectedPage, setSelectedPage] = useState<string>('Pomodoro Timer');

  return (
    <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw]">
      <div className="h-[75vh] w-[75vw] overflow-hidden rounded-[25px] bg-white shadow-lg">
        <div className="flex h-full bg-demo-primary">
          <Sidebar
            setCurrentPlan={setCurrentSubscription}
            currentPlan={currentSubscription[0]}
            setSelectedPage={setSelectedPage}
            selectedPage={selectedPage}
          />
          <div className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]">
            <div className={`flex h-full w-full items-center justify-center bg-white ${selectedPage === "Pomodoro Timer" ? "" : "p-6"}`}>
              <div className="w-full h-full overflow-y-auto">
                {SIDEBAR_ITEMS.find(item => item.name === selectedPage)!.component}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
