const BASE = "/api/expenses";

async function handleResponse(res, defaultMsg) {
  if (!res.ok) {
    const text = await res.text();
    let errorMsg = defaultMsg;
    try {
      const json = JSON.parse(text);
      if (json.details && json.details.length > 0) {
        errorMsg = json.details.map((d) => d.message).join(", ");
      } else {
        errorMsg = json.error || defaultMsg;
      }
    } catch {
      errorMsg = text || defaultMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const fetchExpenses = async ({ category, sort, page = 1, limit = 10, search = "" } = {}) => {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE}?${params}`);
  return handleResponse(res, "Failed to fetch expenses");
};

export async function createExpense(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to create expense");
}

export async function editExpense(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to update expense");
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete expense");
}
