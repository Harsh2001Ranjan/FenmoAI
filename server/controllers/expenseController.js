const expenseService = require("../services/ExpenseService");

const createExpense = async (req, res) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err) {
    if (err.code === 11000) {
      const existing = await require("../models/Expense").findOne({
        idempotencyKey: req.body.idempotencyKey,
      });
      return res.status(200).json(existing);
    }
    res.status(400).json({ error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { category, sort, page, limit, search } = req.query;
    const result = await expenseService.getExpenses({
      category,
      sort,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editExpense = async (req, res) => {
  try {
    const revised = await expenseService.editExpense(req.params.id, req.body);
    res.status(201).json(revised);
  } catch (err) {
    const status = err.message === "Expense not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const deleted = await expenseService.deleteExpense(req.params.id);
    res.status(200).json(deleted);
  } catch (err) {
    const status = err.message === "Expense not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

module.exports = { createExpense, getExpenses, editExpense, deleteExpense };
