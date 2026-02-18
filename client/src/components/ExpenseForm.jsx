import { useState, useRef, useEffect } from "react";
import { createExpense, editExpense } from "../services/api";

const CATEGORIES = ["food", "transport", "utilities", "entertainment", "health", "shopping", "other"];

function generateKey() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function todayStr() {
    return new Date().toISOString().split("T")[0];
}

export default function ExpenseForm({ onCreated, editingExpense, onCancelEdit }) {
    const [form, setForm] = useState({ amount: "", category: "food", description: "", date: "" });
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const keyRef = useRef(generateKey());

    const isEditing = Boolean(editingExpense);

    useEffect(() => {
        if (editingExpense) {
            setForm({
                amount: parseFloat(editingExpense.amount).toFixed(2),
                category: editingExpense.category,
                description: editingExpense.description,
                date: new Date(editingExpense.date).toISOString().split("T")[0],
            });
            setStatus(null);
            setErrors({});
        }
    }, [editingExpense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const errs = {};
        const amount = parseFloat(form.amount);

        if (!form.amount || isNaN(amount)) errs.amount = "Amount is required";
        else if (amount <= 0) errs.amount = "Amount must be greater than zero";
        else if (Math.round(amount * 100) !== amount * 100) errs.amount = "At most 2 decimal places";

        if (!form.description.trim()) errs.description = "Description is required";
        else if (form.description.trim().length > 200) errs.description = "Max 200 characters";

        if (!form.date) errs.date = "Date is required";
        else if (new Date(form.date) > new Date()) errs.date = "Future dates are not allowed";

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        setStatus(null);

        const payload = {
            amount: parseFloat(form.amount),
            category: form.category,
            description: form.description.trim(),
            date: form.date,
        };

        try {
            if (isEditing) {
                await editExpense(editingExpense._id, payload);
                setStatus({ type: "success", message: "Expense updated." });
                onCancelEdit();
            } else {
                await createExpense({ ...payload, idempotencyKey: keyRef.current });
                keyRef.current = generateKey();
                setStatus({ type: "success", message: "Expense added." });
            }
            setForm({ amount: "", category: "food", description: "", date: "" });
            setErrors({});
            onCreated();
        } catch (err) {
            setStatus({ type: "error", message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setForm({ amount: "", category: "food", description: "", date: "" });
        setErrors({});
        setStatus(null);
        onCancelEdit();
    };

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <h2>{isEditing ? "Edit Expense" : "Add Expense"}</h2>

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
                />
                {errors.amount && <span className="field-error">{errors.amount}</span>}
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
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-row">
                <label htmlFor="date">Date</label>
                <input
                    id="date"
                    name="date"
                    type="date"
                    max={todayStr()}
                    value={form.date}
                    onChange={handleChange}
                />
                {errors.date && <span className="field-error">{errors.date}</span>}
            </div>

            {status && (
                <p className={`form-status ${status.type}`}>{status.message}</p>
            )}

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add Expense"}
                </button>
                {isEditing && (
                    <button type="button" className="btn-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
