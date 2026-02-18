const Expense = require("../models/Expense");
const ExpenseFactory = require("../factories/ExpenseFactory");
const { getSortStrategy } = require("../strategies/sortStrategies");
const { buildFilters } = require("../strategies/filterStrategies");

class ExpenseService {
  async createExpense(data) {
    const expenseData = ExpenseFactory.create(data);

    const expense = await Expense.findOneAndUpdate(
      { idempotencyKey: expenseData.idempotencyKey },
      { $setOnInsert: expenseData },
      { upsert: true, new: true, runValidators: true }
    );

    return expense;
  }

  async getExpenses({ category, sort } = {}) {
    const filters = buildFilters({ category });
    const sortStrategy = getSortStrategy(sort);

    const query = Expense.find(filters);
    return sortStrategy.apply(query).exec();
  }

  async deleteExpense(id) {
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) throw new Error("Expense not found");
    return deleted;
  }
}

module.exports = new ExpenseService();
