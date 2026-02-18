const BASE = "/api/expenses";

export async function fetchExpenses({ category, sort } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);

  const url = params.toString() ? `${BASE}?${params}` : BASE;
  const res = await fetch(url);
  
  if (!res.ok) {
    const text = await res.text();
    let errorMsg = "Failed to fetch expenses";
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

export async function createExpense(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = "Failed to create expense";
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = "Failed to delete expense";
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
