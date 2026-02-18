const { z } = require("zod");

const ALLOWED_CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "health",
  "shopping",
  "other",
];

const expenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .refine(
      (v) => Math.round(v * 100) === v * 100,
      "Amount can have at most 2 decimal places"
    ),
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
    }),
  }),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1, "Description cannot be empty")
    .max(200, "Description must be 200 characters or fewer"),
  date: z
    .string({ required_error: "Date is required" })
    .refine((d) => !isNaN(Date.parse(d)), "Date is invalid")
    .refine(
      (d) => new Date(d) <= new Date(),
      "Future dates are not allowed"
    ),
  idempotencyKey: z.string().optional(),
});

module.exports = { expenseSchema, ALLOWED_CATEGORIES };
