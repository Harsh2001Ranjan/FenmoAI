import { useState } from "react";
import { deleteExpense } from "../services/api";
import SkeletonRow from "./SkeletonRow";

export default function ExpenseList({ expenses, loading, onDeleted, onEdit, page, totalPages, onPageChange }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (expense) => {
        if (!window.confirm(`Delete "${expense.description}"?`)) return;

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

    if (!loading && expenses.length === 0) {
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
                        <th className="amount-col">Amount</th>
                        <th className="action-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : (
                        expenses.map((e) => (
                            <tr key={e._id}>
                                <td data-label="Date">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                                <td data-label="Category">
                                    <span className="badge">{e.category}</span>
                                </td>
                                <td data-label="Description">
                                    {e.description}
                                    {e.revision > 1 && (
                                        <span className="revision-badge" title={`Revision ${e.revision}`}>
                                            v{e.revision}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Amount" className="amount-col">₹{parseFloat(e.amount).toFixed(2)}</td>
                                <td className="action-col">
                                    <button
                                        className="btn-edit"
                                        onClick={() => onEdit(e)}
                                        title="Edit expense"
                                    >
                                        Edit
                                    </button>
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
                        ))
                    )}
                </tbody>
            </table>

            {!loading && totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
