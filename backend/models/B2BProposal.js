const mongoose = require('mongoose');

const recommendedProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    estimated_cost: { type: Number, required: true },
    sustainability_note: { type: String },
  },
  { _id: false }
);

const budgetAllocationSchema = new mongoose.Schema(
  {
    product_cost: { type: Number, required: true },
    packaging: { type: Number, required: true },
    logistics: { type: Number, required: true },
  },
  { _id: false }
);

const b2bProposalSchema = new mongoose.Schema(
  {
    // Input fields
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [100, 'Minimum budget is 100'],
    },
    client_type: {
      type: String,
      required: [true, 'Client type is required'],
      trim: true,
    },
    event_type: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    // AI-generated fields
    recommended_products: {
      type: [recommendedProductSchema],
      default: [],
    },
    budget_allocation: {
      type: budgetAllocationSchema,
    },
    impact_summary: {
      type: String,
    },
    // Link to AI log
    aiLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AILog',
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

b2bProposalSchema.index({ client_type: 1, createdAt: -1 });
b2bProposalSchema.index({ status: 1 });

module.exports = mongoose.model('B2BProposal', b2bProposalSchema);
