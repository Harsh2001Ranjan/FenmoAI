import { useState, useRef } from "react";
import { createExpense } from "../services/api";

const CATEGORIES = ["food", "transport", "utilities", "entertainment", "health", "shopping", "other"];

function generateKey() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ExpenseForm({ onCreated }) {
    const [form, setForm] = useState({ amount: "", category: "food", description: "", date: "" });
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const keyRef = useRef(generateKey());

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setStatus(null);

        try {
            const expense = await createExpense({ ...form, idempotencyKey: keyRef.current });
            keyRef.current = generateKey();
            setForm({ amount: "", category: "food", description: "", date: "" });
            setStatus({ type: "success", message: "Expense added." });
            onCreated(expense);
        } catch (err) {
            setStatus({ type: "error", message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <h2>Add Expense</h2>

            <div className="form-row">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="description">Description</label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="What was this for?"
                    value={form.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="date">Date</label>
                <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                />
            </div>

            {status && (
                <p className={`form-status ${status.type}`}>{status.message}</p>
            )}

            <button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Add Expense"}
            </button>
        </form>
    );
}
