class DateDescSort {
  apply(query) {
    return query.sort({ date: -1 });
  }
}

class DefaultSort {
  apply(query) {
    return query.sort({ createdAt: -1 });
  }
}

function getSortStrategy(sortParam) {
  if (sortParam === "date_desc") return new DateDescSort();
  return new DefaultSort();
}

module.exports = { getSortStrategy };
