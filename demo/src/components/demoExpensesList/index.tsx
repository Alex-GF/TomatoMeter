import ExpenseItem from '../demoExpenseItem';
import { ExpenseItemProps } from '../../types';
import { useState } from 'react';
import { FEATURES } from '../../components/featureFlag';

const ExpenseList = ({expenses}: {expenses: ExpenseItemProps[]}) => {
  
  const [categoryColors, setCategoryColors] = useState<{[key: string]: number[]}>({});

  return (
    <div className="space-y-4">
      <table className="table-auto w-full">
        <thead className='mb-12'>
          <tr className='bg-gray-200'>
            <th className='px-4 py-2 rounded-tl-xl'>Payment</th>
            <th className='px-4 py-2'>Amount</th>
            <th className='px-4 py-2'>Category</th>
            <th className='px-4 py-2 rounded-tr-xl'>Budget</th>
          </tr>
        </thead>
        <tbody>
            {expenses.slice(0, FEATURES["expenses"].usageLimits!["maxExpenses"] as number).map((expense, index) => {
            return (
              <ExpenseItem
              key={`expense-${index}`}
              name={expense.name}
              time={expense.time}
              amount={expense.amount}
              category={expense.category}
              budget={expense.budget}
              categoryColors={categoryColors}
              setCategoryColors={setCategoryColors}
              />
            );
            })}
        </tbody>
      </table>
      {/* <ul className='w-full bg-gray-200 flex justify-between p-4 rounded-t-3xl'>
        <li>Payment</li>
        <li>Amount</li>
        <li>Category</li>
        <li>Budget</li>
      </ul>
      {expenses.map((expense, index) => {
        return (
        <ExpenseItem
          key={`expense-${index}`}
          name={expense.name}
          time={expense.time}
          amount={expense.amount}
          category={expense.category}
          budget={expense.budget}
          categoryColors={categoryColors}
          setCategoryColors={setCategoryColors}
        />
      )})} */}
    </div>
  );
};

export default ExpenseList;