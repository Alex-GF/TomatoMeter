import React from 'react';

const monthlyData = [
  { month: 'ene', value: 20 },
  { month: 'feb', value: 40 },
  { month: 'mar', value: 30 },
  { month: 'abr', value: 50 },
  { month: 'may', value: 70 },
  { month: 'jun', value: 90 },
  { month: 'jul', value: 80 },
  { month: 'ago', value: 100 },
  { month: 'sept', value: 120 },
  { month: 'oct', value: 140 },
  { month: 'nov', value: 110 },
  { month: 'dic', value: 100 },
];

const Graph: React.FC = () => {
  return (
    <div className="flex items-end justify-between p-6 bg-white shadow-md rounded-lg">
      {monthlyData.map((data) => (
        <div key={data.month} className="flex flex-col items-center">
          <div
            className="w-4 bg-purple-500 rounded-md"
            style={{
              height: `${data.value}px`,
            }}
          ></div>
          <span className="mt-2 text-sm text-gray-500">{data.month}</span>
        </div>
      ))}
    </div>
  );
};

export default Graph;