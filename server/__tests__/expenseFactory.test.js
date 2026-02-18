const ExpenseFactory = require("../factories/ExpenseFactory");

describe("ExpenseFactory.create", () => {
  const validInput = {
    amount: 42.99,
    category: " Food ",
    description: "  Dinner out  ",
    date: "2025-03-10",
  };

  test("converts amount to Decimal128", () => {
    const result = ExpenseFactory.create(validInput);
    expect(result.amount.toString()).toBe("42.99");
  });

  test("normalizes category to lowercase trimmed", () => {
    const result = ExpenseFactory.create(validInput);
    expect(result.category).toBe("food");
  });

  test("trims description", () => {
    const result = ExpenseFactory.create(validInput);
    expect(result.description).toBe("Dinner out");
  });

  test("converts date string to Date object", () => {
    const result = ExpenseFactory.create(validInput);
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.toISOString()).toContain("2025-03-10");
  });

  test("sets idempotencyKey to undefined when not provided", () => {
    const result = ExpenseFactory.create(validInput);
    expect(result.idempotencyKey).toBeUndefined();
  });

  test("passes through idempotencyKey when provided", () => {
    const result = ExpenseFactory.create({ ...validInput, idempotencyKey: "key-1" });
    expect(result.idempotencyKey).toBe("key-1");
  });

  test("rounds amount to 2 decimal places", () => {
    const result = ExpenseFactory.create({ ...validInput, amount: 10.1 });
    expect(result.amount.toString()).toBe("10.10");
  });
});
