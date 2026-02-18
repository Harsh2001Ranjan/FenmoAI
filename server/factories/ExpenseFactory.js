const mongoose = require("mongoose");

/**
 * Factory for creating Expense data objects.
 * Why a factory? Using a factory centralises data sanitisation and transformation. 
 * This ensures that no matter where the input comes from (API, Seeds, Tests), 
 * the resulting object is always consistent and valid for the database.
 */
class ExpenseFactory {
  static create({ amount, category, description, date, idempotencyKey }) {
    return {
      // Why Decimal128? Money should never be stored as floats due to rounding errors.
      // We convert from string/float to a precise 128-bit decimal at the entry point.
      amount: mongoose.Types.Decimal128.fromString(parseFloat(amount).toFixed(2)),
      
      // Normalising input strings ensures consistency in queries and reports (lowercase, trimmed).
      category: category.trim().toLowerCase(),
      description: description.trim(),
      
      // Cast to Date object to ensure MongoDB indexes and filters work as expected.
      date: new Date(date),
      
      // Pass through the idempotency key for the Service to use in deduplication.
      idempotencyKey: idempotencyKey || undefined,
    };
  }
}

module.exports = ExpenseFactory;
