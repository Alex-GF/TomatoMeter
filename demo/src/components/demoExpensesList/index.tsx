import React from 'react';
import ExpenseItem from '../demoExpenseItem';
import expensesData from '../../data/expenses.json';

const ExpenseList: React.FC = () => {
  return (
    <div className="space-y-4">
      {expensesData.expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          name={expense.name}
          time={expense.time}
          amount={expense.amount}
          category={expense.category}
          budget={expense.budget}
        />
      ))}
    </div>
  );
};

export default ExpenseList;