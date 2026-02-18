import { useState } from "react";
import { deleteExpense } from "../services/api";

export default function ExpenseList({ expenses, loading, onDeleted }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (expense) => {
        const confirmed = window.confirm(
            `Delete "${expense.description}" (₹${parseFloat(expense.amount).toFixed(2)})?`
        );
        if (!confirmed) return;

        setDeletingId(expense._id);
        try {
            await deleteExpense(expense._id);
            onDeleted();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <p className="state-msg">Loading expenses...</p>;
    }

    if (!expenses.length) {
        return <p className="state-msg">No expenses found.</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="expense-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th className="amount-col">Amount (₹)</th>
                        <th className="action-col"></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((e) => (
                        <tr key={e._id}>
                            <td>{new Date(e.date).toLocaleDateString("en-IN")}</td>
                            <td>
                                <span className="badge">{e.category}</span>
                            </td>
                            <td>{e.description}</td>
                            <td className="amount-col">₹{parseFloat(e.amount).toFixed(2)}</td>
                            <td className="action-col">
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(e)}
                                    disabled={deletingId === e._id}
                                    title="Delete expense"
                                >
                                    {deletingId === e._id ? "…" : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
