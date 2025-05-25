import { useEffect, useState } from 'react';

const Graph = () => {

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetch("/api/graph-data").then(response => response.json()).then(data => {
      setMonthlyData(data.monthlyData);
    }).catch(error => {
      console.error('Error:', error);
    });
  }, []);

  return (
    <div className="flex items-end justify-between p-6 shadow-md rounded-lg border-demo-secondary border-2">
      {monthlyData && monthlyData.map((data: {month: string, value: any}) => (
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