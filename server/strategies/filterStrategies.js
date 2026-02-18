class CategoryFilter {
  apply(filters, value) {
    filters.category = value.toLowerCase().trim();
  }
}

function buildFilters(queryParams) {
  const filters = {};
  const strategies = [];

  if (queryParams.category) {
    strategies.push({ strategy: new CategoryFilter(), value: queryParams.category });
  }

  strategies.forEach(({ strategy, value }) => strategy.apply(filters, value));

  return filters;
}

module.exports = { buildFilters };
