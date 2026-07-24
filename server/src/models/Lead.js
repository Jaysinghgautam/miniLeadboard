const mongoose = require('mongoose');

const BUDGET_RANGES = ['<$1k', '$1k-$5k', '$5k-$15k', '$15k+'];
const STATUSES = ['New', 'Contacted', 'Closed'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    budgetRange: {
      type: String,
      required: true,
      enum: BUDGET_RANGES,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'New',
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.BUDGET_RANGES = BUDGET_RANGES;
module.exports.STATUSES = STATUSES;
