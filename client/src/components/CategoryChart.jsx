import { useMemo } from "react";

const CATEGORY_COLORS = {
    food: "#2e7d32",
    transport: "#43a047",
    utilities: "#66bb6a",
    entertainment: "#a5d6a7",
    health: "#1b5e20",
    shopping: "#388e3c",
    other: "#c8e6c9",
};

export default function CategoryChart({ expenses }) {
    const { slices, total } = useMemo(() => {
        const totals = {};
        let sum = 0;

        expenses.forEach((e) => {
            const amt = parseFloat(e.amount);
            totals[e.category] = (totals[e.category] || 0) + amt;
            sum += amt;
        });

        const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

        let cumulative = 0;
        const sliceData = entries.map(([cat, val]) => {
            const pct = sum > 0 ? (val / sum) * 100 : 0;
            const start = cumulative;
            cumulative += pct;
            return { category: cat, amount: val, pct, start, end: cumulative };
        });

        return { slices: sliceData, total: sum };
    }, [expenses]);

    if (!expenses.length) {
        return null;
    }

    const conicStops = slices
        .map((s) => {
            const color = CATEGORY_COLORS[s.category] || "#999";
            return `${color} ${s.start}% ${s.end}%`;
        })
        .join(", ");

    const conicGradient = `conic-gradient(${conicStops})`;

    return (
        <div className="chart-card">
            <h3 className="chart-title">Spending by Category</h3>
            <div className="chart-body">
                <div
                    className="pie"
                    style={{ background: conicGradient }}
                >
                    <div className="pie-center">
                        <span className="pie-total">₹{total.toFixed(0)}</span>
                        <span className="pie-label">Total</span>
                    </div>
                </div>
                <ul className="chart-legend">
                    {slices.map((s) => (
                        <li key={s.category} className="legend-item">
                            <span
                                className="legend-dot"
                                style={{ background: CATEGORY_COLORS[s.category] || "#999" }}
                            />
                            <span className="legend-cat">{s.category}</span>
                            <span className="legend-pct">{s.pct.toFixed(1)}%</span>
                            <span className="legend-amt">₹{s.amount.toFixed(0)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
