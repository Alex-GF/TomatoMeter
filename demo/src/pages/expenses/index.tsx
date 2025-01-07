import React from 'react';
import Sidebar from '../../components/demoSidebar';
import Header from '../../components/demoHeader';
import Graph from '../../components/demoGraph';
import ExpenseList from '../../components/demoExpensesList';

const ExpensesPage: React.FC = () => {
  return (
    <div className="flex h-full bg-demo-primary">
      <Sidebar />
      <div className="flex-grow flex flex-col my-6 mr-6 rounded-[25px] overflow-hidden">
        <Header />
        <div className="p-6 space-y-6 bg-white">
          <Graph />
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Enero (31 payments)</h2>
            <ExpenseList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;