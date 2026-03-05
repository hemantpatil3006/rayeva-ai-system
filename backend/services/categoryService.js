const { buildCategoryPrompt } = require('../ai/promptBuilder');
const { callAI, validateResponseSchema } = require('../ai/openaiService');
const { logAIInteraction } = require('../ai/aiLogger');
const ProductCategory = require('../models/ProductCategory');
const { logger } = require('../utils/logger');

/**
 * AI Category & Tag Generator Service
 *
 * Flow:
 * 1. Build structured prompt from product input
 * 2. Call OpenAI with JSON mode
 * 3. Validate response schema
 * 4. Persist to MongoDB
 * 5. Log interaction (file + DB)
 *
 * @param {string} productName
 * @param {string} description
 * @returns {Promise<{ savedProduct: object, aiResult: object, logId: string }>}
 */
const generateCategory = async (productName, description) => {
  logger.info(`[CategoryService] Processing: "${productName}"`);

  // Step 1: Build prompt
  const { systemPrompt, userPrompt } = buildCategoryPrompt(productName, description);
  const fullPromptLog = `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}`;

  let aiResult;
  let rawResponse;
  let usage;
  let processingTimeMs;
  let logEntry;

  try {
    // Step 2: Call OpenAI
    const result = await callAI(systemPrompt, userPrompt, { temperature: 0.3 });
    aiResult = result.parsed;
    rawResponse = result.raw;
    usage = result.usage;
    processingTimeMs = result.processingTimeMs;

    // Step 3: Validate response schema
    validateResponseSchema(aiResult, [
      'primary_category',
      'sub_category',
      'seo_tags',
      'sustainability_filters',
    ]);

    // Ensure array fields are actually arrays
    if (!Array.isArray(aiResult.seo_tags)) {
      throw new Error('AI response: seo_tags must be an array');
    }
    if (!Array.isArray(aiResult.sustainability_filters)) {
      throw new Error('AI response: sustainability_filters must be an array');
    }

    // Step 4: Log success
    logEntry = await logAIInteraction({
      module: 'category-generator',
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
      module: 'category-generator',
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
  const savedProduct = await ProductCategory.create({
    product_name: productName,
    description,
    primary_category: aiResult.primary_category,
    sub_category: aiResult.sub_category,
    seo_tags: aiResult.seo_tags,
    sustainability_filters: aiResult.sustainability_filters,
    aiLogId: logEntry?._id,
  });

  logger.info(`[CategoryService] Saved product: ${savedProduct._id}`);

  return {
    savedProduct,
    aiResult,
    logId: logEntry?._id,
  };
};

module.exports = { generateCategory };
