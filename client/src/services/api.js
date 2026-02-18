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

export async function fetchExpenses({ category, sort } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);

  const url = params.toString() ? `${BASE}?${params}` : BASE;
  const res = await fetch(url);
  return handleResponse(res, "Failed to fetch expenses");
}

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
