const { body, param } = require('express-validator');
const { BUDGET_RANGES, STATUSES } = require('../models/Lead');

const createLeadRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('budgetRange')
    .notEmpty()
    .withMessage('Budget range is required')
    .isIn(BUDGET_RANGES)
    .withMessage(`Budget range must be one of: ${BUDGET_RANGES.join(', ')}`),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
];

const updateStatusRules = [
  param('id').isMongoId().withMessage('Invalid lead id'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

module.exports = { createLeadRules, updateStatusRules };
