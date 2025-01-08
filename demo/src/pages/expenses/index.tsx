import React, { useState } from 'react';
import Sidebar from '../../components/demoSidebar';
import Header from '../../components/demoHeader';
import Graph from '../../components/demoGraph';
import ExpenseList from '../../components/demoExpensesList';
import expensesData from '../../data/expenses.json';
import { ExpenseItemProps } from '../../types';
import FeatureFlag from '../../components/featureFlag';

const ExpensesPage: React.FC = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseItemProps[]>(expensesData.expenses);

  return (
    <div className="flex h-full bg-demo-primary">
      <Sidebar />
      <div className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]">
        <Header monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} />
        <div className="space-y-6 bg-white px-6 h-5/6 overflow-y-scroll">
          <FeatureFlag featureName="expensesGraph">
            <Graph />
          </FeatureFlag>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">January ({monthlyExpenses.length} payments)</h2>
            <FeatureFlag featureName="expenses">
              <ExpenseList expenses={monthlyExpenses} />
            </FeatureFlag>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
