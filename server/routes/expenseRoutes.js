const express = require("express");
const { createExpense, getExpenses, editExpense, deleteExpense } = require("../controllers/expenseController");
const { validate } = require("../middleware/validate");
const { expenseSchema } = require("../validation/expenseSchema");

const router = express.Router();

router.get("/", getExpenses);
router.post("/", validate(expenseSchema), createExpense);
router.put("/:id", validate(expenseSchema), editExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
