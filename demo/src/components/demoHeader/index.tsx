import { FaCirclePlus } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa';
import { ExpenseItemProps } from '../../types';
import { generateExpense } from '../../utils/generators/expensesGenerator';
import FeatureFlag from '../featureFlag';
import { OpenFeatureClientManager } from '../../proxy/open-feature/src/proxy';
import { useContext } from 'react';
import { FeatureTogglingContext } from '../../contexts/featureFlagContext';

const Header = ({
  monthlyExpenses,
  setMonthlyExpenses,
}: {
  monthlyExpenses: ExpenseItemProps[];
  setMonthlyExpenses: Function;
}) => {

  const {currentLibrary} = useContext(FeatureTogglingContext)!;

  function addMonthlyExpense() {
    setMonthlyExpenses([
      generateExpense(),
      ...monthlyExpenses,
    ]);

    if (currentLibrary === 'openFeatureProvider') {
      OpenFeatureClientManager.setUserContext({
        ...OpenFeatureClientManager.userContext,
        createdExpenses: OpenFeatureClientManager.userContext.createdExpenses + 1,
      })
    }
  }

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md h-1/6">
      <h1 className="flex items-center text-xl font-semibold text-gray-800">
        <FaCreditCard className="mr-6 fill-demo-secondary" />{' '}
        <span className="text-[30px]">Expenses</span>
      </h1>
      <FeatureFlag featureName='expenses'>
        <button className="flex items-center text-purple-500 hover:text-purple-700">
          <FaCirclePlus className="mr-2 h-12 w-12" onClick={addMonthlyExpense} />
        </button>
      </FeatureFlag>
    </div>
  );
};

export default Header;
