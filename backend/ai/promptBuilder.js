/**
 * Prompt Builder — centralized factory for AI prompts.
 * Each builder returns a system message + user message pair.
 */

/**
 * Builds prompt for the AI Category & Tag Generator module.
 * @param {string} productName
 * @param {string} description
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
const buildCategoryPrompt = (productName, description) => {
  const systemPrompt = `You are an expert sustainable commerce product categorization AI for Rayeva, a platform dedicated to eco-friendly and sustainable products.

Your job is to analyze product information. You MUST return your answer strictly matching this exactly formatted JSON structure. Do not include markdown blocks or any other text outside the JSON.
{
  "primary_category": "string",
  "sub_category": "string",
  "seo_tags": ["string", "string", "string", "string"],
  "sustainability_filters": ["string", "string"]
}

Available primary_category options: "Personal Care", "Home & Kitchen", "Stationery", "Food & Beverage", "Clothing & Fashion", "Wellness"
Available sustainability_filters options: "plastic-free", "compostable", "vegan", "organic", "recycled-material", "biodegradable", "fair-trade", "zero-waste", "carbon-neutral", "upcycled", "natural", "cruelty-free"

RULES:
1. Return ONLY valid JSON — nothing else.
2. All string values must be non-empty.
3. seo_tags must contain at least 4 items, focusing on sustainability angles.
4. sustainability_filters must contain at least 1 item from the available list.`;

  const userPrompt = `Categorize this sustainable product for the Rayeva platform:

Product Name: "${productName}"
Description: "${description}"

Return a JSON object with: primary_category, sub_category, seo_tags (array), sustainability_filters (array).`;

  return { systemPrompt, userPrompt };
};

/**
 * Builds prompt for the B2B Proposal Generator module.
 * @param {number} budget
 * @param {string} clientType
 * @param {string} eventType
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
const buildProposalPrompt = (budget, clientType, eventType) => {
  const systemPrompt = `You are an expert sustainable procurement consultant AI for Rayeva, specializing in eco-friendly corporate gifts and event supplies.

Your job is to generate a tailored B2B sustainable product proposal.

You MUST return your answer strictly matching this exactly formatted JSON structure. Do not include markdown blocks or any other text outside the JSON.
{
  "recommended_products": [
    {
      "name": "string",
      "quantity": 0,
      "estimated_cost": 0,
      "sustainability_note": "string"
    }
  ],
  "budget_allocation": {
    "product_cost": 0,
    "packaging": 0,
    "logistics": 0
  },
  "impact_summary": "string"
}

RULES:
1. Return ONLY valid JSON — nothing else.
2. budget_allocation.product_cost + budget_allocation.packaging + budget_allocation.logistics MUST equal the total budget exactly.
3. The sum of all recommended_products estimated_cost MUST equal budget_allocation.product_cost exactly.
4. Recommend 3-6 real, commercially available sustainable products.
5. All quantities must be realistic for the client type and event.
6. Focus exclusively on eco-friendly, sustainable, ethical products.`;

  const userPrompt = `Generate a sustainable B2B product proposal for Rayeva:

Budget: $${budget} USD
Client Type: "${clientType}"
Event Type: "${eventType}"

Return a JSON object with: recommended_products (array with name, quantity, estimated_cost, sustainability_note), budget_allocation (product_cost, packaging, logistics), impact_summary.`;

  return { systemPrompt, userPrompt };
};

/**
 * Builds prompt for Impact Report generation (Module 3 - future)
 * @param {object} aggregatedData
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
const buildImpactReportPrompt = (aggregatedData) => {
  const systemPrompt = `You are a sustainability impact analyst AI for Rayeva. Generate an accurate and compelling impact report based on product and sales data.

Return a JSON object with:
- plastic_saved_kg: estimated kilograms of plastic avoided
- carbon_avoided_kg: estimated kg of CO2 equivalent avoided
- products_sustainably_sourced: count
- impact_narrative: A 2-3 sentence human-readable summary

RULES:
1. Return ONLY valid JSON
2. Use realistic sustainability calculation estimates
3. Be accurate and transparent about estimates`;

  const userPrompt = `Generate an impact report for this Rayeva data: ${JSON.stringify(aggregatedData)}`;

  return { systemPrompt, userPrompt };
};

module.exports = { buildCategoryPrompt, buildProposalPrompt, buildImpactReportPrompt };
