const express = require("express");
const { createExpense, getExpenses, deleteExpense } = require("../controllers/expenseController");

const router = express.Router();

router.post("/", createExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;
