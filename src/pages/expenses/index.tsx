import React, { useState } from 'react';
import Header from '../../components/header';
import Graph from '../../components/graph';
import ExpenseList from '../../components/expensesList';
import expensesData from '../../data/expenses.json';
import { ExpenseItemProps } from '../../types';

const ExpensesPage: React.FC = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseItemProps[]>(expensesData.expenses);

  return (
    <>
      <Header monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} />
      <div className="h-5/6 space-y-6 overflow-y-scroll bg-white px-6">
        <Graph />
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            January ({monthlyExpenses.length} payments)
          </h2>
          <ExpenseList expenses={monthlyExpenses} />
        </div>
      </div>
    </>
  );
};

export default ExpensesPage;
