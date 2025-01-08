import { faker } from "@faker-js/faker";
import { ExpenseItemProps } from "../../types";

export function generateExpense(): ExpenseItemProps{
    return {
        name: faker.commerce.product(),
        time: `${faker.number.int({min: 0, max: 12}).toString().padStart(2, '0')}:${faker.number.int({min: 0, max: 59}).toString().padStart(2, '0')}`,
        amount: parseFloat(faker.finance.amount({min: 1, max: 1000})),
        category: faker.commerce.department(),
        budget: faker.number.float({min: 0, max: 1, multipleOf: 0.1})
    }
}