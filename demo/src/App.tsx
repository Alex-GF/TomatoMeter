import ExpensesPage from "./pages/expenses";

export default function App() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-200 p-[5vw]">
      {/* <div id="control-panel"></div> */}
      <div className="w-[75vw] h-[75vh] bg-white rounded-[25px] shadow-lg overflow-hidden">
        <ExpensesPage />
      </div>
    </main>
  );
}
