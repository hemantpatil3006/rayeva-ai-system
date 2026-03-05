# Rayeva AI Platform 🌿

> **Production-ready AI-powered sustainable commerce platform.**

---

## Overview

Rayeva is a B2B/B2C sustainable commerce platform that uses OpenAI to automate product categorization, generate corporate proposals, and assist customers via WhatsApp. Built with a clean, layered architecture separating AI concerns from business logic.

---

## Architecture

```
rayeva-ai/
├── backend/
│   ├── server.js              # Express entry point
│   ├── routes/
│   │   └── aiRoutes.js        # API route definitions
│   ├── controllers/
│   │   ├── categoryController.js   # Module 1 input validation + response
│   │   └── proposalController.js   # Module 2 input validation + response
│   ├── services/
│   │   ├── categoryService.js      # Module 1 business logic
│   │   └── proposalService.js      # Module 2 business logic
│   ├── ai/
│   │   ├── promptBuilder.js   # Centralized prompt factory (system + user)
│   │   ├── openaiService.js   # OpenAI API wrapper (JSON mode)
│   │   └── aiLogger.js        # Dual logger (Winston file + MongoDB)
│   ├── models/
│   │   ├── AILog.js           # AI interaction audit trail
│   │   ├── ProductCategory.js # Module 1 results storage
│   │   └── B2BProposal.js     # Module 2 results storage
│   ├── middleware/
│   │   ├── validate.js        # express-validator error formatter
│   │   ├── errorHandler.js    # Global error handler
│   │   └── requestLogger.js   # HTTP request logging
│   └── utils/
│       ├── logger.js          # Winston app + AI logger instances
│       └── responseHelper.js  # Standardized response wrappers
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── ProductUploadPage.jsx   # Module 1 UI
│       │   └── ProposalPage.jsx        # Module 2 UI
│       ├── components/
│       │   ├── ResultCard.jsx          # Reusable AI result card
│       │   └── LoadingSpinner.jsx      # Animated spinner
│       └── services/
│           └── api.js                  # Axios API client
└── logs/
    ├── combined.log       # All app logs
    ├── error.log          # Error-level logs only
    └── ai-prompts.log     # AI prompt+response structured logs
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone & Configure
```bash
# Copy and fill environment variables
cp rayeva-ai/.env.example rayeva-ai/.env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/rayeva
OPENAI_API_KEY=sk-your-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 2. Start Backend
```bash
cd rayeva-ai/backend
npm install
npm run dev
```

Server starts on **http://localhost:5000**

### 3. Start Frontend
```bash
cd rayeva-ai/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## API Reference

### Module 1 — Category Generator

**POST** `/api/ai/category`

Request:
```json
{
  "product_name": "Bamboo Toothbrush",
  "description": "Eco-friendly toothbrush made from bamboo handle with BPA-free bristles"
}
```

Response:
```json
{
  "success": true,
  "message": "Category and tags generated successfully",
  "data": {
    "id": "65f...",
    "primary_category": "Personal Care",
    "sub_category": "Oral Care",
    "seo_tags": ["bamboo toothbrush", "eco friendly toothbrush", "plastic free dental care", "sustainable oral care"],
    "sustainability_filters": ["plastic-free", "compostable", "vegan"],
    "ai_log_id": "65f..."
  }
}
```

**GET** `/api/ai/category?page=1&limit=10`

---

### Module 2 — B2B Proposal Generator

**POST** `/api/ai/proposal`

Request:
```json
{
  "budget": 5000,
  "client_type": "Corporate office",
  "event_type": "Employee welcome kits"
}
```

Response:
```json
{
  "success": true,
  "message": "B2B proposal generated successfully",
  "data": {
    "id": "65f...",
    "recommended_products": [
      { "name": "Reusable Coffee Cup", "quantity": 200, "estimated_cost": 1500, "sustainability_note": "BPA-free, replaces 200 disposable cups daily" },
      { "name": "Bamboo Notebooks", "quantity": 200, "estimated_cost": 2000, "sustainability_note": "FSC-certified bamboo, fully biodegradable" }
    ],
    "budget_allocation": {
      "product_cost": 3500,
      "packaging": 500,
      "logistics": 1000
    },
    "impact_summary": "This proposal replaces single-use plastics and supports sustainable sourcing.",
    "ai_log_id": "65f..."
  }
}
```

**GET** `/api/ai/proposals?page=1&limit=10`

---

## Prompt Design

### Why JSON Mode?
We use OpenAI's `response_format: { type: 'json_object' }` so the API guarantees valid JSON output — no regex parsing, no markdown stripping.

### Temperature Strategy
- **Module 1 (Category)**: `temperature: 0.3` — low randomness for consistent categorization
- **Module 2 (Proposal)**: `temperature: 0.4` — slightly higher for product variety

### Prompt Structure
```
SYSTEM PROMPT = Role definition + Output schema + Hard rules
USER PROMPT   = Specific input data + JSON keys expected
```

The system prompt defines **what JSON keys to output** and **hard rules** (e.g., budget allocation must sum to total). This drastically reduces schema validation errors.

---

## Logging

All AI interactions are logged in two places:
1. **`logs/ai-prompts.log`** — Structured JSON, timestamped, module-tagged
2. **MongoDB `ailogs` collection** — Queryable audit trail with token usage

Sample log entry:
```json
{
  "timestamp": "2026-03-05 18:30:00",
  "level": "info",
  "message": "AI Interaction",
  "module": "category-generator",
  "status": "success",
  "tokensUsed": 312,
  "processingTimeMs": 1842
}
```

---

## Module 3 — Impact Reporting (Architecture)

**Goal**: Aggregate sustainability impact across all orders.

**Endpoints**:
- `GET /api/impact/report` — Full platform impact report
- `GET /api/impact/report/:month` — Monthly breakdown

**Logic**:
1. Aggregate `ProductCategory` docs → count sustainability_filters
2. Aggregate `B2BProposal` docs → sum product quantities
3. Apply conversion constants (e.g. 1 bamboo product ≈ 0.3kg plastic saved)
4. Call OpenAI to generate narrative summary
5. Return: `plastic_saved_kg`, `carbon_avoided_kg`, `products_sustainably_sourced`, `impact_narrative`

**New Models**: `ImpactReport { month, plastic_saved_kg, carbon_avoided_kg, products_count, narrative, generatedAt }`

---

## Module 4 — WhatsApp Support Bot (Architecture)

**Goal**: Automated customer support via WhatsApp Cloud API.

**Endpoints**:
- `GET /api/whatsapp/webhook` — Verify webhook (token challenge)
- `POST /api/whatsapp/webhook` — Receive & process messages

**Intent Routing**:
| User Message | Bot Action |
|---|---|
| "Where is my order?" | Look up order in DB → reply with status |
| "What is your return policy?" | Return static FAQ response |
| "I want a refund" | Create support ticket → escalate to human |
| Default | Friendly fallback + escalation offer |

**New Models**:
- `WhatsAppConversation { phone_number, messages[], intent, status, createdAt }`
- `SupportTicket { phone_number, issue_type, status, conversation_id }`

**New Services**: `whatsappService.js`, `intentClassifierService.js`, `orderLookupService.js`

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `OPENAI_API_KEY` | OpenAI API key |
| `WHATSAPP_TOKEN` | WhatsApp Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone ID |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token |
| `FRONTEND_URL` | Frontend URL for CORS |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o (JSON mode) |
| Logging | Winston (file + console) |
| Messaging | WhatsApp Cloud API (Module 4) |
| Env | dotenv |
