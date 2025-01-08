import { FaCirclePlus } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa';
import { ExpenseItemProps } from '../../types';
import { generateExpense } from '../../utils/generators/expensesGenerator';

const Header = ({
  monthlyExpenses,
  setMonthlyExpenses,
}: {
  monthlyExpenses: ExpenseItemProps[];
  setMonthlyExpenses: Function;
}) => {
  function addMonthlyExpense() {
    setMonthlyExpenses([
      generateExpense(),
      ...monthlyExpenses,
    ]);
  }

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md h-1/6">
      <h1 className="flex items-center text-xl font-semibold text-gray-800">
        <FaCreditCard className="mr-6 fill-demo-secondary" />{' '}
        <span className="text-[30px]">Expenses</span>
      </h1>
      <button className="flex items-center text-purple-500 hover:text-purple-700">
        <FaCirclePlus className="mr-2 h-12 w-12" onClick={addMonthlyExpense} />
      </button>
    </div>
  );
};

export default Header;
