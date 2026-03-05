const express = require('express');
const router = express.Router();

const { createCategory, categoryValidation, getCategories } = require('../controllers/categoryController');
const { createProposal, proposalValidation, getProposals } = require('../controllers/proposalController');

// ─── Module 1: AI Category & Tag Generator ───────────────────────────────────
/**
 * @route  POST /api/ai/category
 * @desc   Generate AI category, sub-category, SEO tags, and sustainability filters
 * @access Public
 * @body   { product_name: string, description: string }
 */
router.post('/category', categoryValidation, createCategory);

/**
 * @route  GET /api/ai/category
 * @desc   Get all stored product categories
 * @access Public
 * @query  page, limit, category
 */
router.get('/category', getCategories);

// ─── Module 2: B2B Proposal Generator ────────────────────────────────────────
/**
 * @route  POST /api/ai/proposal
 * @desc   Generate a B2B sustainable product proposal
 * @access Public
 * @body   { budget: number, client_type: string, event_type: string }
 */
router.post('/proposal', proposalValidation, createProposal);

/**
 * @route  GET /api/ai/proposals
 * @desc   Get all stored B2B proposals
 * @access Public
 * @query  page, limit, status
 */
router.get('/proposals', getProposals);

// ─── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'AI routes healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
