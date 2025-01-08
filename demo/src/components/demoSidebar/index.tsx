import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white w-64 h-full flex flex-col items-center py-10 px-4">
      <div className="text-center mb-8">
        <div className="bg-white text-black rounded-full w-32 h-32 flex items-center justify-center mx-auto">
          <span className="font-bold text-[40px]">U</span>
        </div>
        <h1 className="mt-4 text-xl font-semibold">Welcome</h1>
        <p className="text-sm mt-2 text-white rounded-lg bg-purple-500 p-3"><span className='font-bold'>userid:</span> 76773296 </p>
      </div>
      <div className='h-[0.05rem] w-40 bg-gray-400'></div>
      <nav className="flex-grow mt-6 w-full">
        <ul className="space-y-4 ml-4">
          <li className="text-[20px] font-bold text-gray-400 hover:text-white cursor-pointer">Dashboard</li>
          <li className="text-[20px] font-bold text-gray-400 hover:text-white cursor-pointer">Summary</li>
          <li className="text-[20px] font-bold text-white pl-2 relative before:h-full before:absolute before:bg-white before:w-[5px] before:left-[-10px]">Expenses</li>
          <li className="text-[20px] font-bold text-gray-400 hover:text-white cursor-pointer">Wallet</li>
          <li className="text-[20px] font-bold text-gray-400 hover:text-white cursor-pointer">Settings</li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;