const BASE = "/api/expenses";

/**
 * Global response handler for fetch requests.
 * Why? Instead of parsing JSON and checking 'res.ok' in every single function, 
 * this utility centralises the logic. It also handles Zod validation errors 
 * and standard server errors, converting them into user-friendly JavaScript 
 * Errors that the UI can catch and display.
 */
async function handleResponse(res, defaultMsg) {
  if (!res.ok) {
    const text = await res.text();
    let errorMsg = defaultMsg;
    try {
      // Try to parse structured error messages from the server's Centralised Error Handler.
      const json = JSON.parse(text);
      if (json.details && json.details.length > 0) {
        // Concatenate multiple validation errors (e.g., from Zod).
        errorMsg = json.details.map((d) => d.message).join(", ");
      } else {
        errorMsg = json.error || defaultMsg;
      }
    } catch {
      // Fallback if the server returns a non-JSON error (e.g. 502/504 HTML page).
      errorMsg = text || defaultMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

/**
 * Fetches expenses with Support for Pagination, Filtering, and Search.
 * Why URLSearchParams? It ensures that special characters in search queries 
 * are correctly escaped, preventing malformed URLs.
 */
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
