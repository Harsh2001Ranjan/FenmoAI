export default function ExpenseSummary({ expenses }) {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return (
        <div className="summary">
            <span>Showing {expenses.length} expense{expenses.length !== 1 ? "s" : ""}</span>
            <span className="total">Total: ₹{total.toFixed(2)}</span>
        </div>
    );
}
