const mongoose = require("mongoose");

class ExpenseFactory {
  static create({ amount, category, description, date, idempotencyKey }) {
    if (amount === undefined || amount === null || amount === "") {
      throw new Error("Amount is required");
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    if (!category || !category.trim()) {
      throw new Error("Category is required");
    }

    if (!description || !description.trim()) {
      throw new Error("Description is required");
    }

    if (!date) {
      throw new Error("Date is required");
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Date is invalid");
    }

    return {
      amount: mongoose.Types.Decimal128.fromString(parsedAmount.toFixed(2)),
      category: category.trim().toLowerCase(),
      description: description.trim(),
      date: parsedDate,
      idempotencyKey: idempotencyKey || undefined,
    };
  }
}

module.exports = ExpenseFactory;
