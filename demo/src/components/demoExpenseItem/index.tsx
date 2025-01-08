import { faker } from '@faker-js/faker';
import { useEffect, useRef } from 'react';

const ExpenseItem = ({
  name,
  time,
  amount,
  category,
  budget,
  categoryColors,
  setCategoryColors,
}: {
  name: string;
  time: string;
  amount: number;
  category: string;
  budget: number;
  categoryColors: Record<string, number[]>;
  setCategoryColors: (value: Record<string, number[]>) => void;
}) => {
  const categoryTag = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (categoryTag.current) {
      let categoryColor;

      // console.log(categoryColors);
      // console.log(category);

      if (!categoryColors[category]) {
        const color = faker.color.rgb({format: 'decimal'});
        categoryColor = color;
        setCategoryColors({
          ...categoryColors,
          [category]: color,
        });
      } else {
        categoryColor = categoryColors[category];
      }

      categoryTag.current.style.backgroundColor = `rgba(${categoryColor.join(', ')}, 0.2)`;
      categoryTag.current.style.color = `rgba(${categoryColor.join(', ')}, 1)`;
    }
  }, [category, categoryColors]);

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center w-1/3">
        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold text-gray-800">${amount.toFixed(2)}</p>
        <span className="rounded-full px-3 py-1 text-xs text-center" ref={categoryTag}>
          {category}
        </span>
      </div>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-purple-500"
          style={{ width: `${budget * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ExpenseItem;
