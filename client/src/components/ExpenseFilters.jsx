const CATEGORIES = ["food", "transport", "utilities", "entertainment", "health", "shopping", "other"];

export default function ExpenseFilters({ category, sortDesc, onCategoryChange, onSortChange }) {
    return (
        <div className="filters">
            <div className="filter-group">
                <label htmlFor="filter-category">Filter by category</label>
                <select
                    id="filter-category"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="">All categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="sort-toggle">Sort</label>
                <select
                    id="sort-toggle"
                    value={sortDesc ? "date_desc" : ""}
                    onChange={(e) => onSortChange(e.target.value === "date_desc")}
                >
                    <option value="">Default</option>
                    <option value="date_desc">Newest first</option>
                </select>
            </div>
        </div>
    );
}
