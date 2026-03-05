const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: ['category-generator', 'proposal-generator', 'impact-report', 'whatsapp-bot'],
    },
    prompt: {
      type: String,
      required: true,
    },
    rawResponse: {
      type: String,
    },
    parsedResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
    tokensUsed: {
      type: Number,
    },
    modelUsed: {
      type: String,
      default: 'gpt-4o',
    },
    processingTimeMs: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
aiLogSchema.index({ module: 1, createdAt: -1 });
aiLogSchema.index({ status: 1 });

module.exports = mongoose.model('AILog', aiLogSchema);
