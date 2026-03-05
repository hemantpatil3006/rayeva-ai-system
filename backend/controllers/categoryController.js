const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { generateCategory } = require('../services/categoryService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { logger } = require('../utils/logger');
const ProductCategory = require('../models/ProductCategory');

// Validation rules for the category endpoint
const categoryValidation = [
  body('product_name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be 2-200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  validate,
];

/**
 * POST /api/ai/category
 * Generate AI-powered category and tags for a sustainable product.
 */
const createCategory = async (req, res, next) => {
  try {
    const { product_name, description } = req.body;

    logger.info(`[CategoryController] Request: product="${product_name}"`);

    const { savedProduct, aiResult, logId } = await generateCategory(product_name, description);

    return successResponse(
      res,
      {
        id: savedProduct._id,
        product_name: savedProduct.product_name,
        description: savedProduct.description,
        primary_category: aiResult.primary_category,
        sub_category: aiResult.sub_category,
        seo_tags: aiResult.seo_tags,
        sustainability_filters: aiResult.sustainability_filters,
        ai_log_id: logId,
        created_at: savedProduct.createdAt,
      },
      'Category and tags generated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/category
 * Retrieve all previously generated categories.
 */
const getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = category ? { primary_category: new RegExp(category, 'i') } : {};
    const [items, total] = await Promise.all([
      ProductCategory.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ProductCategory.countDocuments(query),
    ]);

    return successResponse(res, {
      items,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, categoryValidation, getCategories };
