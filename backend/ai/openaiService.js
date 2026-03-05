require("dotenv").config();
const axios = require("axios");
const { logger } = require("../utils/logger");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const callAI = async (systemPrompt, userPrompt, options = {}) => {
  const model = options.model || "moonshotai/kimi-k2.5";
  const temperature = options.temperature ?? 0.3;
  const max_tokens = options.max_tokens || 1500;

  const apiKey = process.env.OPENROUTER_API_KEY;

  const isMockMode = !apiKey || apiKey === "your_openrouter_api_key_here";

  const startTime = Date.now();

  // ============================
  // MOCK MODE
  // ============================
  if (isMockMode) {
    logger.warn("[AI] Running in MOCK mode");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockParsed = {
      primary_category: "Lifestyle",
      sub_category: "Reusable Bags",
      seo_tags: [
        "organic cotton bag",
        "reusable grocery bag",
        "eco friendly shopping bag"
      ],
      sustainability_filters: [
        "reusable",
        "plastic-free",
        "biodegradable"
      ]
    };

    return {
      parsed: mockParsed,
      raw: JSON.stringify(mockParsed),
      usage: { total_tokens: 100 },
      processingTimeMs: Date.now() - startTime
    };
  }

  try {
    logger.info(`[AI] Calling OpenRouter model: ${model}`);

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        temperature,
        max_tokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const processingTimeMs = Date.now() - startTime;

    const rawContent =
      response.data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("AI returned empty response");
    }

    let parsed;

    try {
      let cleanedContent = rawContent.trim();

      // Attempt to extract JSON from markdown or conversational wrappers
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || cleanedContent.match(/(\{[\s\S]*\})/);

      if (jsonMatch && jsonMatch[1]) {
        cleanedContent = jsonMatch[1];
      }

      parsed = JSON.parse(cleanedContent.trim());
    } catch (err) {
      logger.error(`JSON parsing failed. Raw content: ${rawContent}`);
      throw new Error("AI response was not valid JSON");
    }

    return {
      parsed,
      raw: rawContent,
      usage: response.data.usage,
      processingTimeMs
    };
  } catch (error) {
    logger.error("OpenRouter API error:", error.response?.data || error.message);

    throw new Error(
      `AI service error: ${error.response?.data?.error?.message || error.message
      }`
    );
  }
};

const validateResponseSchema = (parsed, requiredKeys) => {
  const missing = requiredKeys.filter((key) => !(key in parsed));

  if (missing.length) {
    throw new Error(`AI response missing fields: ${missing.join(", ")}`);
  }
};

module.exports = { callAI, validateResponseSchema };