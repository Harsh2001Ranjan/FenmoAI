import { useState, useEffect, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm";
import CategoryChart from "./components/CategoryChart";
import ExpenseFilters from "./components/ExpenseFilters";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import { fetchExpenses } from "./services/api";
import useDebounce from "./hooks/useDebounce";
import "./App.css";

/**
 * App.jsx: The Root Orchestrator.
 * Why is this a single large component? 
 * For a small-to-medium app like this, centralising state here prevents 
 * "prop drilling" and ensures the Chart, Summary, and List always stay 
 * in perfect sync without needing a heavy state manager like Redux.
 */
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  // Why Debounce? Without it, every keystroke in the search bar triggers 
  // an API call. Debouncing to 500ms ensures we only fetch once the user 
  // pauses, reducing server load and preventing UI jitter.
  const debouncedSearch = useDebounce(search, 500);

  const [sortDesc, setSortDesc] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Server-side pagination state.
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * memoized fetcher.
   * Why useCallback? This function is passed to child components. 
   * If not memoized, it would be recreated on every render, triggering 
   * unnecessary re-renders of the Form and Filter components.
   */
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, meta } = await fetchExpenses({
        category: category || undefined,
        sort: sortDesc ? "date_desc" : undefined,
        page,
        limit: 10,
        search: debouncedSearch || undefined,
      });
      setExpenses(data);
      setTotalPages(meta.pages);
      setPage(meta.page);
    } catch (err) {
      setFetchError(err.message || "Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, sortDesc, page, debouncedSearch]);

  // Initial load and dependency-based refresh.
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  /**
   * Auto-reset to first page on filter change.
   * Why? If a user is on page 5 and searches for something with only 1 page 
   * of results, staying on page 5 would show an empty list. 
   * Resetting to page 1 ensures the user sees the relevant results.
   */
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track where your money goes</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <ExpenseForm
            onCreated={loadExpenses}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />
          {/* Shared state 'expenses' drives the Chart and Summary */}
          <CategoryChart expenses={expenses} />
        </section>

        <section className="list-section">
          <ExpenseFilters
            category={category}
            sortDesc={sortDesc}
            onCategoryChange={setCategory}
            onSortChange={setSortDesc}
            search={search}
            onSearchChange={setSearch}
          />

          {fetchError ? (
            <p className="state-msg error">{fetchError}</p>
          ) : (
            <>
              <ExpenseSummary expenses={expenses} />
              <ExpenseList
                expenses={expenses}
                loading={loading}
                onDeleted={loadExpenses}
                onEdit={setEditingExpense}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Developed by Harsh Ranjan @2026</p>
      </footer>
    </div>
  );
}
