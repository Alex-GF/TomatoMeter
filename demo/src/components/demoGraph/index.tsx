import React from 'react';

const monthlyData = [
  { month: 'Jan', value: 20 },
  { month: 'Feb', value: 40 },
  { month: 'Mar', value: 30 },
  { month: 'Apr', value: 50 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 90 },
  { month: 'Jul', value: 80 },
  { month: 'Aug', value: 100 },
  { month: 'Sep', value: 120 },
  { month: 'Oct', value: 140 },
  { month: 'Nov', value: 110 },
  { month: 'Dec', value: 100 },
];

const Graph: React.FC = () => {
  return (
    <div className="flex items-end justify-between p-6 shadow-md rounded-lg border-demo-secondary border-2">
      {monthlyData.map((data) => (
        <div key={data.month} className="flex flex-col items-center w-[7%]">
          <div
            className="w-full bg-purple-500 rounded-md"
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