import React, { useContext, useState } from 'react';
import Sidebar from '../../components/demoSidebar';
import Header from '../../components/demoHeader';
import Graph from '../../components/demoGraph';
import ExpenseList from '../../components/demoExpensesList';
import expensesData from '../../data/expenses.json';
import { ExpenseItemProps } from '../../types';
import FeatureFlag from '../../components/featureFlag';
import { SubscriptionContext } from '../../contexts/subscriptionContext';

const ExpensesPage: React.FC = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseItemProps[]>(expensesData.expenses);
  const {currentSubscription, setCurrentSubscription} = useContext(SubscriptionContext)!;

  return (
    <div className="flex h-full bg-demo-primary">
      <Sidebar setCurrentPlan={setCurrentSubscription} currentPlan={currentSubscription[0]} />
      <div className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]">
        <Header monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} />
        <div className="h-5/6 space-y-6 overflow-y-scroll bg-white px-6">
          {currentSubscription && (
            <FeatureFlag featureName="expensesGraph">
              <Graph currentPlan={currentSubscription[0]} />
            </FeatureFlag>
          )}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              January ({monthlyExpenses.length} payments)
            </h2>
            <ExpenseList expenses={monthlyExpenses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
