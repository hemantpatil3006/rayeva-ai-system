import axios from 'axios';

const api = axios.create({
  // Use the environment variable if present (production), otherwise default to the local Vite proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 120s timeout for AI calls
});

// Response interceptor for error normalisation
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

/**
 * Generate AI category & tags for a product.
 * @param {string} productName
 * @param {string} description
 */
export const generateCategory = (productName, description) =>
  api.post('/ai/category', { product_name: productName, description });

/**
 * Get all stored product categories.
 */
export const getCategories = (page = 1, limit = 10) =>
  api.get(`/ai/category?page=${page}&limit=${limit}`);

/**
 * Generate a B2B sustainable product proposal.
 * @param {number} budget
 * @param {string} clientType
 * @param {string} eventType
 */
export const generateProposal = (budget, clientType, eventType) =>
  api.post('/ai/proposal', { budget, client_type: clientType, event_type: eventType });

/**
 * Get all stored B2B proposals.
 */
export const getProposals = (page = 1, limit = 10) =>
  api.get(`/ai/proposals?page=${page}&limit=${limit}`);
