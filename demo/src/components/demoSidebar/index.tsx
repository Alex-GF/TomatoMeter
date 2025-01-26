import { useEffect } from 'react';
import { OpenFeatureClientManager } from '../../proxy/open-feature/src/proxy';

const Sidebar = ({currentPlan, setCurrentPlan}: {currentPlan: string | undefined, setCurrentPlan: Function}) => {
  const updatePlan = (newPlan: string) => {
    setCurrentPlan([newPlan]);
    OpenFeatureClientManager.setSubscription([newPlan]);
  };

  const handleSubscriptionChange = (newPlan: string) => {
    fetch('/api/user/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPlan: newPlan }),
    })
      .then(response => response.json())
      .then(data => {
        updatePlan(data.userPlan);
      });
  };

  useEffect(() => {
    fetch('/api/user/plan')
      .then(response => response.json())
      .then(data => {
        updatePlan(data.userPlan);
      });
  }, []);

  return (
    <div className="flex h-full w-64 flex-col items-center bg-gray-900 px-4 py-10 text-white">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white text-black">
          <span className="text-[40px] font-bold">U</span>
        </div>
        <h1 className="mt-4 text-xl font-semibold">Welcome</h1>
        <p className="mt-2 rounded-lg bg-purple-500 p-3 text-sm text-white hover:cursor-pointer" onClick={() => handleSubscriptionChange(currentPlan === 'PREMIUM' ? 'FREE' : 'PREMIUM')}>
          <span className="font-bold">Active Plan:</span> {currentPlan}{' '}
        </p>
      </div>
      <div className="h-[0.05rem] w-40 bg-gray-400"></div>
      <nav className="mt-6 w-full flex-grow">
        <ul className="ml-4 space-y-4">
          <li className="cursor-pointer text-[20px] font-bold text-gray-400 hover:text-white">
            Dashboard
          </li>
          <li className="cursor-pointer text-[20px] font-bold text-gray-400 hover:text-white">
            Summary
          </li>
          <li className="relative pl-2 text-[20px] font-bold text-white before:absolute before:left-[-10px] before:h-full before:w-[5px] before:bg-white">
            Expenses
          </li>
          <li className="cursor-pointer text-[20px] font-bold text-gray-400 hover:text-white">
            Wallet
          </li>
          <li className="cursor-pointer text-[20px] font-bold text-gray-400 hover:text-white">
            Settings
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
