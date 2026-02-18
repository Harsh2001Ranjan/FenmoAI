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

  async getExpenses({ category, sort, page = 1, limit = 50, search = "" }) {
    // 1. Build initial filters
    const filters = buildFilters({ category });
    filters.isActive = true;

    // 2. Add search filter
    if (search) {
      filters.description = { $regex: search, $options: "i" };
    }

    // 3. Count total for pagination
    const total = await Expense.countDocuments(filters);

    // 4. Create base query with filters
    let query = Expense.find(filters);

    // 5. Apply sorting
    const sortStrategy = getSortStrategy(sort);
    query = sortStrategy.apply(query);

    // 6. Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(Number(limit));

    // 7. Execute query
    const expenses = await query.exec();

    return {
      data: expenses,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
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
