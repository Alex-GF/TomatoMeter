import React from 'react';

interface ExpenseItemProps {
  name: string;
  time: string;
  amount: number;
  category: string;
  budget: number;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ name, time, amount, category, budget }) => {
  const categoryColors: { [key: string]: string } = {
    'Food & Drinks': 'bg-red-100 text-red-500',
    Grocery: 'bg-green-100 text-green-500',
    Uncategorized: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-purple-100 text-purple-500 flex items-center justify-center rounded-full mr-4">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-800">${amount.toFixed(2)}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-500'}`}
        >
          {category}
        </span>
      </div>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full"
          style={{ width: `${budget * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ExpenseItem;