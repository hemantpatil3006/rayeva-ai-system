const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { generateProposal } = require('../services/proposalService');
const { successResponse } = require('../utils/responseHelper');
const { logger } = require('../utils/logger');
const B2BProposal = require('../models/B2BProposal');

// Validation rules for the proposal endpoint
const proposalValidation = [
  body('budget')
    .notEmpty().withMessage('Budget is required')
    .isNumeric().withMessage('Budget must be a number')
    .custom((val) => val >= 100).withMessage('Budget must be at least $100'),
  body('client_type')
    .trim()
    .notEmpty().withMessage('Client type is required')
    .isLength({ min: 2, max: 200 }).withMessage('Client type must be 2-200 characters'),
  body('event_type')
    .trim()
    .notEmpty().withMessage('Event type is required')
    .isLength({ min: 2, max: 200 }).withMessage('Event type must be 2-200 characters'),
  validate,
];

/**
 * POST /api/ai/proposal
 * Generate a B2B sustainable product proposal.
 */
const createProposal = async (req, res, next) => {
  try {
    const { budget, client_type, event_type } = req.body;

    logger.info(`[ProposalController] Request: client="${client_type}" budget=$${budget}`);

    const { savedProposal, aiResult, logId } = await generateProposal(
      Number(budget),
      client_type,
      event_type
    );

    return successResponse(
      res,
      {
        id: savedProposal._id,
        budget: savedProposal.budget,
        client_type: savedProposal.client_type,
        event_type: savedProposal.event_type,
        recommended_products: aiResult.recommended_products,
        budget_allocation: aiResult.budget_allocation,
        impact_summary: aiResult.impact_summary,
        ai_log_id: logId,
        created_at: savedProposal.createdAt,
      },
      'B2B proposal generated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/proposals
 * Retrieve all previously generated proposals.
 */
const getProposals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = status ? { status } : {};
    const [items, total] = await Promise.all([
      B2BProposal.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      B2BProposal.countDocuments(query),
    ]);

    return successResponse(res, {
      items,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProposal, proposalValidation, getProposals };
