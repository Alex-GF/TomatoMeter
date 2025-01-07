import ExpensesPage from "./pages/expenses";

export default function App() {
  return (
    <main className="flex items-center justify-between h-screen bg-gray-200 p-[5vw]">
      <div id="control-panel"></div>
      <div className="w-[50vw] h-[50vh] bg-white rounded-[25px] shadow-lg overflow-hidden">
        <ExpensesPage />
      </div>
    </main>
  );
}
