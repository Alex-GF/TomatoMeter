import React from 'react';
import { FaCirclePlus } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <h1 className="flex items-center text-xl font-semibold text-gray-800"><FaCreditCard className='fill-demo-secondary mr-6'/> <span className='text-[30px]'>Expenses</span></h1>
      <button className="flex items-center text-purple-500 hover:text-purple-700">
        <FaCirclePlus className="w-6 h-6 mr-2" />
        <span>Add</span>
      </button>
    </div>
  );
};

export default Header;