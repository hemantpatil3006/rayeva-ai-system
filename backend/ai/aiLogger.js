const { aiLogger } = require('../utils/logger');
const AILog = require('../models/AILog');

/**
 * Log an AI interaction to both the Winston file logger and MongoDB.
 *
 * @param {object} params
 * @param {string} params.module         - Module name (e.g. 'category-generator')
 * @param {string} params.prompt         - The full prompt sent to OpenAI (system + user combined for log)
 * @param {string} params.rawResponse    - Raw string response from OpenAI
 * @param {object} params.parsedResponse - Parsed JSON object
 * @param {string} params.status         - 'success' | 'failed' | 'partial'
 * @param {string} [params.errorMessage] - Error message if status is 'failed'
 * @param {object} [params.usage]        - OpenAI token usage object
 * @param {number} [params.processingTimeMs] - Time taken for the API call
 * @param {string} [params.modelUsed]    - OpenAI model used
 * @returns {Promise<object>} The saved AILog document
 */
const logAIInteraction = async ({
  module,
  prompt,
  rawResponse,
  parsedResponse,
  status = 'success',
  errorMessage,
  usage,
  processingTimeMs,
  modelUsed = 'gpt-4o',
}) => {
  // 1. File-based structured log via Winston aiLogger
  aiLogger.info('AI Interaction', {
    module,
    status,
    prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...[truncated]' : ''), // Truncate for readability
    parsedResponse,
    errorMessage,
    tokensUsed: usage?.total_tokens,
    processingTimeMs,
    modelUsed,
  });

  // 2. Persist to MongoDB
  try {
    const logEntry = await AILog.create({
      module,
      prompt,
      rawResponse,
      parsedResponse,
      status,
      errorMessage,
      tokensUsed: usage?.total_tokens,
      modelUsed,
      processingTimeMs,
    });
    return logEntry;
  } catch (dbError) {
    // Log DB error but don't fail the main request
    aiLogger.error('Failed to save AILog to MongoDB', { error: dbError.message, module });
    return null;
  }
};

module.exports = { logAIInteraction };
