import ExpensesPage from '../../pages/expenses';

export function DemoApp() {
  return (
    <main className="flex h-screen items-center justify-center bg-gray-200 p-[5vw]">
      <div className="h-[75vh] w-[75vw] overflow-hidden rounded-[25px] bg-white shadow-lg">
        <ExpensesPage />
      </div>
    </main>
  );
}
