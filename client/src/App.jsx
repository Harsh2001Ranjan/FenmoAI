import { useState, useEffect, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseFilters from "./components/ExpenseFilters";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import { fetchExpenses } from "./services/api";
import "./App.css";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchExpenses({
        category: category || undefined,
        sort: sortDesc ? "date_desc" : undefined,
      });
      setExpenses(data);
    } catch {
      setFetchError("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, sortDesc]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleCreated = () => {
    loadExpenses();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track where your money goes</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <ExpenseForm onCreated={handleCreated} />
        </section>

        <section className="list-section">
          <ExpenseFilters
            category={category}
            sortDesc={sortDesc}
            onCategoryChange={setCategory}
            onSortChange={setSortDesc}
          />

          {fetchError ? (
            <p className="state-msg error">{fetchError}</p>
          ) : (
            <>
              <ExpenseSummary expenses={expenses} />
              <ExpenseList expenses={expenses} loading={loading} onDeleted={loadExpenses} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
