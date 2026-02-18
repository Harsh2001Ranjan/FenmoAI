const { expenseSchema } = require("../validation/expenseSchema");

describe("expenseSchema", () => {
  const validData = {
    amount: 25.5,
    category: "food",
    description: "Lunch at cafe",
    date: "2025-01-15",
  };

  test("accepts valid expense data", () => {
    const result = expenseSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data.amount).toBe(25.5);
    expect(result.data.description).toBe("Lunch at cafe");
  });

  test("rejects zero amount", () => {
    const result = expenseSchema.safeParse({ ...validData, amount: 0 });
    expect(result.success).toBe(false);
    const msg = result.error.issues[0].message;
    expect(msg).toMatch(/greater than zero/i);
  });

  test("rejects negative amount", () => {
    const result = expenseSchema.safeParse({ ...validData, amount: -10 });
    expect(result.success).toBe(false);
  });

  test("rejects amount with more than 2 decimal places", () => {
    const result = expenseSchema.safeParse({ ...validData, amount: 10.123 });
    expect(result.success).toBe(false);
    const msg = result.error.issues[0].message;
    expect(msg).toMatch(/2 decimal/i);
  });

  test("rejects string amount", () => {
    const result = expenseSchema.safeParse({ ...validData, amount: "ten" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid category", () => {
    const result = expenseSchema.safeParse({ ...validData, category: "pets" });
    expect(result.success).toBe(false);
    const msg = result.error.issues[0].message;
    expect(msg).toMatch(/invalid/i);
  });

  test("rejects empty description", () => {
    const result = expenseSchema.safeParse({ ...validData, description: "   " });
    expect(result.success).toBe(false);
  });

  test("rejects description over 200 characters", () => {
    const longDesc = "a".repeat(201);
    const result = expenseSchema.safeParse({ ...validData, description: longDesc });
    expect(result.success).toBe(false);
  });

  test("rejects future date", () => {
    const futureDate = "2099-12-31";
    const result = expenseSchema.safeParse({ ...validData, date: futureDate });
    expect(result.success).toBe(false);
    const msg = result.error.issues[0].message;
    expect(msg).toMatch(/future/i);
  });

  test("rejects invalid date string", () => {
    const result = expenseSchema.safeParse({ ...validData, date: "not-a-date" });
    expect(result.success).toBe(false);
  });

  test("trims description whitespace", () => {
    const result = expenseSchema.safeParse({ ...validData, description: "  hello  " });
    expect(result.success).toBe(true);
    expect(result.data.description).toBe("hello");
  });

  test("idempotencyKey is optional", () => {
    const result = expenseSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data.idempotencyKey).toBeUndefined();
  });

  test("accepts idempotencyKey when provided", () => {
    const result = expenseSchema.safeParse({ ...validData, idempotencyKey: "abc-123" });
    expect(result.success).toBe(true);
    expect(result.data.idempotencyKey).toBe("abc-123");
  });
});
