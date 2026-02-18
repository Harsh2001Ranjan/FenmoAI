const mongoose = require("mongoose");

/**
 * Why Decimal128? 
 * Money calculations (adding/multiplying) in JavaScript using standard Number (Float64) 
 * can lead to errors like 0.1 + 0.2 = 0.30000000000000004. 
 * MongoDB's Decimal128 provides high-precision arithmetic to ensure financial accuracy.
 */
const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, "Amount is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    /**
     * Why idempotencyKey? 
     * Network requests can fail AFTER the database is updated. 
     * By storing a unique client-generated key, we can prevent duplicate entries 
     * if the user/client retries the same operation.
     */
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    /**
     * Why Soft-Delete (isActive + revision)? 
     * Direct hard-deletes are destructive and non-reversable.
     * By using 'isActive', we can hide items from the UI while keeping them 
     * available for audit history or recovery.
     * Revision tracking allows us to reconstruct how an expense was edited over time.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
    revision: {
      type: Number,
      default: 1,
    },
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
  },
  { timestamps: true }
);

// We transform Decimal128 back to Number when sending to the client 
// purely for ease of use in the UI (React). Calculation precision is maintained 
// on the server/DB side.
expenseSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.amount = parseFloat(ret.amount.toString());
    return ret;
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
