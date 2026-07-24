const express = require('express');
const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { createLeadRules, updateStatusRules } = require('../validators/leadValidator');

const router = express.Router();

function fieldErrors(req) {
  const result = validationResult(req);
  if (result.isEmpty()) return null;
  const fields = {};
  result.array().forEach((err) => {
    if (!fields[err.path]) fields[err.path] = err.msg;
  });
  return fields;
}

// POST /api/leads — create a new lead
router.post('/', createLeadRules, async (req, res, next) => {
  try {
    const fields = fieldErrors(req);
    if (fields) {
      return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
    }

    const { name, email, budgetRange, message } = req.body;
    const lead = await Lead.create({ name, email, budgetRange, message });

    return res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

// GET /api/leads?q=&status= — list leads, newest first
router.get('/', async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};

    if (status && ['New', 'Contacted', 'Closed'].includes(status)) {
      filter.status = status;
    }

    if (q && q.trim()) {
      const term = q.trim();
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { message: regex }];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(leads);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id/status — update a lead's status
router.patch('/:id/status', updateStatusRules, async (req, res, next) => {
  try {
    const fields = fieldErrors(req);
    if (fields) {
      return res.status(400).json({ error: 'Invalid request.', fields });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    return res.json(lead);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
