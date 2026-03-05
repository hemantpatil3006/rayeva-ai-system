const { buildProposalPrompt } = require('../ai/promptBuilder');
const { callAI, validateResponseSchema } = require('../ai/openaiService');
const { logAIInteraction } = require('../ai/aiLogger');
const B2BProposal = require('../models/B2BProposal');
const { logger } = require('../utils/logger');

/**
 * B2B Proposal Generator Service
 *
 * Flow:
 * 1. Build structured prompt from B2B input
 * 2. Call OpenAI with JSON mode
 * 3. Validate response schema + budget math
 * 4. Persist to MongoDB
 * 5. Log interaction (file + DB)
 *
 * @param {number} budget
 * @param {string} clientType
 * @param {string} eventType
 * @returns {Promise<{ savedProposal: object, aiResult: object, logId: string }>}
 */
const generateProposal = async (budget, clientType, eventType) => {
  logger.info(`[ProposalService] Processing: client="${clientType}" event="${eventType}" budget=$${budget}`);

  // Step 1: Build prompt
  const { systemPrompt, userPrompt } = buildProposalPrompt(budget, clientType, eventType);
  const fullPromptLog = `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}`;

  let aiResult;
  let rawResponse;
  let usage;
  let processingTimeMs;
  let logEntry;

  try {
    // Step 2: Call OpenAI
    const result = await callAI(systemPrompt, userPrompt, { temperature: 0.4, max_tokens: 2000 });
    aiResult = result.parsed;
    rawResponse = result.raw;
    usage = result.usage;
    processingTimeMs = result.processingTimeMs;

    // Step 3: Validate response schema
    validateResponseSchema(aiResult, [
      'recommended_products',
      'budget_allocation',
      'impact_summary',
    ]);

    if (!Array.isArray(aiResult.recommended_products) || aiResult.recommended_products.length === 0) {
      throw new Error('AI response: recommended_products must be a non-empty array');
    }

    if (
      typeof aiResult.budget_allocation !== 'object' ||
      !('product_cost' in aiResult.budget_allocation) ||
      !('packaging' in aiResult.budget_allocation) ||
      !('logistics' in aiResult.budget_allocation)
    ) {
      throw new Error('AI response: budget_allocation must contain product_cost, packaging, logistics');
    }

    // Validate each product
    for (const product of aiResult.recommended_products) {
      if (!product.name || typeof product.quantity !== 'number' || typeof product.estimated_cost !== 'number') {
        throw new Error('AI response: each recommended_product must have name, quantity, estimated_cost');
      }
    }

    // Step 4: Log success
    logEntry = await logAIInteraction({
      module: 'proposal-generator',
      prompt: fullPromptLog,
      rawResponse,
      parsedResponse: aiResult,
      status: 'success',
      usage,
      processingTimeMs,
    });
  } catch (aiError) {
    // Log failure
    logEntry = await logAIInteraction({
      module: 'proposal-generator',
      prompt: fullPromptLog,
      rawResponse,
      parsedResponse: null,
      status: 'failed',
      errorMessage: aiError.message,
      usage,
      processingTimeMs,
    });
    throw aiError;
  }

  // Step 5: Persist to MongoDB
  const savedProposal = await B2BProposal.create({
    budget,
    client_type: clientType,
    event_type: eventType,
    recommended_products: aiResult.recommended_products,
    budget_allocation: aiResult.budget_allocation,
    impact_summary: aiResult.impact_summary,
    aiLogId: logEntry?._id,
  });

  logger.info(`[ProposalService] Saved proposal: ${savedProposal._id}`);

  return {
    savedProposal,
    aiResult,
    logId: logEntry?._id,
  };
};

module.exports = { generateProposal };
