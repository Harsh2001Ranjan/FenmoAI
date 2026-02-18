import { useState, useEffect, useCallback } from "react";
import ExpenseForm from "./components/ExpenseForm";
import CategoryChart from "./components/CategoryChart";
import ExpenseFilters from "./components/ExpenseFilters";
import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import { fetchExpenses } from "./services/api";
import useDebounce from "./hooks/useDebounce";
import "./App.css";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortDesc, setSortDesc] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Reset page when filters change
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
