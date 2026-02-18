const CATEGORIES = ["food", "transport", "utilities", "entertainment", "health", "shopping", "other"];

export default function ExpenseFilters({ category, sortDesc, onCategoryChange, onSortChange, search, onSearchChange }) {
    return (
        <div className="filters">
            <div className="filter-group" style={{ flex: 2 }}>
                <label htmlFor="search">Search</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search descriptions..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        padding: "0.45rem 0.6rem",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        fontSize: "0.88rem",
                        background: "#fafafa"
                    }}
                />
            </div>

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
