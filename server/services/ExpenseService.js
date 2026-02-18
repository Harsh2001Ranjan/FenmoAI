const Expense = require("../models/Expense");
const ExpenseFactory = require("../factories/ExpenseFactory");
const { getSortStrategy } = require("../strategies/sortStrategies");
const { buildFilters } = require("../strategies/filterStrategies");

class ExpenseService {
  /**
   * Creates an expense using an idempotency check to handle network retries safely.
   * We use findOneAndUpdate with upsert because it's atomic at the DB level,
   * preventing race conditions that manual "check then insert" logic would face.
   */
  async createExpense(data) {
    const expenseData = ExpenseFactory.create(data);

    const expense = await Expense.findOneAndUpdate(
      { idempotencyKey: expenseData.idempotencyKey },
      { $setOnInsert: expenseData },
      { upsert: true, new: true, runValidators: true }
    );

    return expense;
  }

  /**
   * Fetches expenses using a Strategy pattern for sorting and filtering.
   * Why? By decoupling query building into strategies, the service remains 
   * agnostic of specific DB query syntax or complex business rules, 
   * making it easier to add new filters (like date ranges) later.
   */
  async getExpenses({ category, sort, page = 1, limit = 50, search = "" }) {
    const filters = buildFilters({ category });
    filters.isActive = true; // Only show live records; historical revisions are hidden by default.

    if (search) {
      // Regexp search is used for flexible description matching.
      // 'i' flag ensures the search is case-insensitive for better UX.
      filters.description = { $regex: search, $options: "i" };
    }

    const total = await Expense.countDocuments(filters);

    let query = Expense.find(filters);

    const sortStrategy = getSortStrategy(sort);
    query = sortStrategy.apply(query);

    // Skip/Limit pagination ensures we don't overwhelm the client or DB 
    // when the dataset grows to thousands of entries.
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(Number(limit));

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

  /**
   * Implements "Append-only" immutable updates.
   * Instead of overwriting, we deactivate the old record and link a new one.
   * Why? Financial data requires an audit trail. Overwriting deletes history; 
   * revisioning preserves it for potential dispute resolution or auditing.
   */
  async editExpense(id, data) {
    const original = await Expense.findOne({ _id: id, isActive: true });
    if (!original) throw new Error("Expense not found");

    // Soft-deactivate the predecessor.
    await Expense.findByIdAndUpdate(id, { isActive: false });

    const expenseData = ExpenseFactory.create(data);
    const revised = await Expense.create({
      ...expenseData,
      revision: original.revision + 1,
      // Track the root ancestor to allow reconstructuring the full history chain.
      originalId: original.originalId || original._id,
    });

    return revised;
  }

  /**
   * Soft-delete implementation.
   * Why? Accidental deletions are common. Marking as inactive hides the record 
   * from the UI but keeps data recoverable and maintains DB referential integrity.
   */
  async deleteExpense(id) {
    const expense = await Expense.findOne({ _id: id, isActive: true });
    if (!expense) throw new Error("Expense not found");

    await Expense.findByIdAndUpdate(id, { isActive: false });
    return expense;
  }
}

module.exports = new ExpenseService();
