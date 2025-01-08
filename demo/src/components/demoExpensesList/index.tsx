import ExpenseItem from '../demoExpenseItem';
import { ExpenseItemProps } from '../../types';
import { useEffect, useState } from 'react';

const ExpenseList = ({expenses}: {expenses: ExpenseItemProps[]}) => {
  
  const [categoryColors, setCategoryColors] = useState<{[key: string]: number[]}>({});
  
  useEffect(() => {
    // console.log(expenses);
  }, [expenses]);

  return (
    <div className="space-y-4">
      {expenses.map((expense, index) => {
        
        console.log(expense.category);
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
      )})}
    </div>
  );
};

export default ExpenseList;