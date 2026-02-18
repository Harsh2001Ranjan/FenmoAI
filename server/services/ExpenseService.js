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
    filters.isActive = true;
    const sortStrategy = getSortStrategy(sort);

    const query = Expense.find(filters);
    return sortStrategy.apply(query).exec();
  }

  async editExpense(id, data) {
    const original = await Expense.findOne({ _id: id, isActive: true });
    if (!original) throw new Error("Expense not found");

    await Expense.findByIdAndUpdate(id, { isActive: false });

    const expenseData = ExpenseFactory.create(data);
    const revised = await Expense.create({
      ...expenseData,
      revision: original.revision + 1,
      originalId: original.originalId || original._id,
    });

    return revised;
  }

  async deleteExpense(id) {
    const expense = await Expense.findOne({ _id: id, isActive: true });
    if (!expense) throw new Error("Expense not found");

    await Expense.findByIdAndUpdate(id, { isActive: false });
    return expense;
  }
}

module.exports = new ExpenseService();
