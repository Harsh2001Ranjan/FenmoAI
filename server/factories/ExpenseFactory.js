const mongoose = require("mongoose");

class ExpenseFactory {
  static create({ amount, category, description, date, idempotencyKey }) {
    return {
      amount: mongoose.Types.Decimal128.fromString(parseFloat(amount).toFixed(2)),
      category: category.trim().toLowerCase(),
      description: description.trim(),
      date: new Date(date),
      idempotencyKey: idempotencyKey || undefined,
    };
  }
}

module.exports = ExpenseFactory;
