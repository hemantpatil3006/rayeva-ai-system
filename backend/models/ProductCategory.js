const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // AI-generated fields
    primary_category: {
      type: String,
      required: true,
    },
    sub_category: {
      type: String,
      required: true,
    },
    seo_tags: {
      type: [String],
      default: [],
    },
    sustainability_filters: {
      type: [String],
      default: [],
    },
    // Link to AI log
    aiLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AILog',
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index
productCategorySchema.index({ product_name: 'text', description: 'text' });
productCategorySchema.index({ primary_category: 1, sub_category: 1 });

module.exports = mongoose.model('ProductCategory', productCategorySchema);
