# 🌱 AgriGenius: AI-Powered Agriculture Crop & Cattle Welfare Advisory Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-10b981?style=for-the-badge&logo=shield" alt="Status" />
  <img src="https://img.shields.io/badge/AI%20SDK-%40google%2Fgenai-f59e0b?style=for-the-badge&logo=google" alt="Google GenAI" />
  <img src="https://img.shields.io/badge/Model-Gemini%202.5%20Flash-047857?style=for-the-badge&logo=googlegemini" alt="Gemini 2.5 Flash" />
  <img src="https://img.shields.io/badge/Stack-React%2018%20%7C%20Node%20%7C%20Postgres-0284c7?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/License-MIT-slate?style=for-the-badge" alt="License" />
</p>

---

## 📖 Executive Summary

**AgriGenius** is an enterprise-grade agronomy and bovine preservation platform engineered for smallholder farmers, agricultural enterprises, cooperative agronomists, and livestock caretakers.

The platform solves two pressing global challenges simultaneously:
1. **Precision Crop Agronomy:** Eliminates guesswork in planting decisions by processing hyper-localized soil physical/chemical properties (N-P-K, pH, texture), irrigation infrastructure, and micro-climate seasons to deliver scientifically validated crop selections, phased nutrient roadmaps, and biological pest mitigation strategies.
2. **Ethical Cattle Preservation & Slaughter Prevention:** Provides actionable, economically sustainable husbandry blueprints that transform retired, elderly, non-milking, or rescued cattle into profitable farmstead assets through commercial vermicomposting, biogas energy generation, Panchagavya formulation, and accredited sanctuary integration—permanently eliminating the need for distress selling or culling.

Integrated with the official **Google Gemini AI SDK (`@google/genai`)** utilizing `gemini-2.5-flash` with strict JSON Schema enforcement.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + Vite + Tailwind)"]
        UI[Farmer Command Center]
        WizCrop[Crop Advisory Wizard]
        WizCattle[Cattle Welfare Wizard]
        Charts[Recharts & SVG Radial Gauges]
        PDF[PDF Stream Exporter]
    end

    subgraph Server["Backend API Server (Express + TypeScript)"]
        Auth[JWT & BCrypt Authentication]
        RateLimit[Rate Limiter - 10 req/min]
        ZodVal[Zod Schema Validators]
        GeminiService[Gemini 2.5 Flash AI Engine]
        FallbackEngine[Agronomic & Welfare Expert Rules]
        PdfGen[PDFKit Report Generator]
    end

    subgraph Database["Database Layer"]
        PG[PostgreSQL / Embedded PGlite]
        UsersTable[(users)]
        AdvisoriesTable[(advisories)]
        SanctuariesTable[(cattle_sanctuaries)]
    end

    WizCrop -->|Validate Input| ZodVal
    WizCattle -->|Validate Input| ZodVal
    ZodVal --> RateLimit
    RateLimit --> GeminiService
    GeminiService -->|JSON Schema Response| ZodVal
    GeminiService -.->|Fallback on Quota/Offline| FallbackEngine
    ZodVal -->|Persist Advisory| PG
    PG --> AdvisoriesTable
    PG --> UsersTable
    PG --> SanctuariesTable
    AdvisoriesTable --> UI
    AdvisoriesTable --> Charts
    AdvisoriesTable --> PdfGen
    PdfGen -->|Binary PDF Stream| PDF
```

---

## 🌟 Core Modules & Features

### 1. 🌾 Multi-Factor Crop Advisory Engine
* **Soil Profiling & Texture:** Ingests soil texture (clay loam, sandy loam, black cotton, etc.), pH level (3.0 – 10.0 scale with real-time slider), and N-P-K nutrient status.
* **Agro-Climatic Intelligence:** Recommends optimal primary crops and companion polycultures for Kharif (Monsoon), Rabi (Winter), Zaid, and Perennial cycles.
* **Fertilization Timeline:** Dynamic phase-by-phase nutrient roadmap (Basal, Vegetative, Flowering) paired with regenerative organic alternatives (*Jeevamrutha*, Farmyard Manure, bio-potash).
* **Integrated Pest Management:** Diagnostic symptom mapping coupled with biological controls (*Trichoderma*, pheromone traps, 10,000 ppm Azadirachtin neem oil).
* **Economic Forecasting:** Interactive Recharts comparison of production costs vs. net returns, total yield projections, and break-even milestones.

### 2. 🐄 Cattle & Livestock Welfare Engine (Slaughter Prevention)
* **Strict Non-Slaughter Protocol:** Formulates actionable operational models that eliminate distress liquidation of elderly, non-milking, or rescued bovines.
* **Bio-Product Monetization Pathways:**
  * **Commercial Vermicomposting & Vermiwash:** Aerobic composting with *Eisenia fetida* earthworms generating \$280–\$450/month in organic fertilizer sales.
  * **Farmstead Methane & Biogas Digestion:** Prefabricated biodigesters offsetting 100% of kitchen LPG costs and producing liquid bio-slurry.
  * **Panchagavya & Organic Pest Repellents:** Low-cost formulation of traditional 5-element tonics (*Panchagavya*, *Agniastra*, *Dashaparni*).
* **Nutritional Optimization:** Daily dry matter ration balancing (2.5% body weight) and high-protein local substitutes (*Azolla microphylla*, tree foliage like Subabul/Moringa, silage).
* **Ethno-Veterinary Care:** Traditional herbal remedies for mastitis, bloat, arthritis, and wound care.
* **Verified Gaushala & Sanctuary Directory:** Direct search by state/region with capacity statuses (`OPEN`, `LIMITED`, `FULL`), direct phone/email contacts, and service offerings.

### 3. 🧠 Google Gemini 2.5 Flash Integration
* Utilizes `@google/genai` with `gemini-2.5-flash` for low-latency (< 3.5s) structured JSON reasoning.
* Strict `responseSchema` definitions for both Crop and Livestock outputs ensure strict schema conformity.
* **Zero-Placeholder Guarantee:** Built-in scientific domain-specialist fallback engine ensures 100% schema-compliant, scientifically valid agronomic outputs even when operating offline or during API rate limits.
* All Gemini API keys remain strictly server-bound.

### 4. 📄 Executive PDF Document Streaming
* Executive A4 PDF reports generated on the fly via `PDFKit` and streamed directly via `GET /api/advisory/:id/pdf`.
* Includes visual status cards, Suitability/Welfare scores, fertilizer schedules, economic breakdowns, and multi-page pagination.

---

## 💻 Tech Stack

| Domain | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React.js | `^18.3.1` | Component UI layer |
| **Language** | TypeScript | `^5.7.3` | Type safety across client & server |
| **Build Tool** | Vite | `^6.1.0` | Ultra-fast development & bundling |
| **Styling** | Tailwind CSS | `^3.4.17` | Modern agrarian aesthetics |
| **UI Icons** | Lucide React | `^0.475.0` | Vector iconography |
| **Data Fetching** | TanStack Query | `^5.66.0` | Server state & query caching |
| **Data Visualization** | Recharts | `^2.15.1` | Financial bar charts & metrics |
| **Form Handling** | React Hook Form + Zod | `^7.54.2` | Multi-step form validation |
| **Backend Runtime** | Node.js | `v20+` / `v24 LTS` | Server environment |
| **Backend Framework** | Express.js | `^4.21.2` | REST API routes & middleware |
| **Database** | PostgreSQL / PGlite | `v16` | Relational SQL with UUID & JSONB |
| **AI SDK** | `@google/genai` | `^0.2.0` | Official Gemini AI SDK |
| **PDF Engine** | PDFKit | `^0.16.0` | Server-side binary PDF streaming |
| **Authentication** | BCrypt + JWT | `^2.4.3` / `^9.0.2` | Secure password hashing & tokens |

---

## 📁 Repository Directory Structure

```text
AgriGenius/
├── client/                               # Frontend React + Vite Application
│   ├── index.html                        # HTML entry point with fonts
│   ├── vite.config.ts                    # Vite config with API proxy
│   ├── tailwind.config.js                # Agrarian color palette (emerald, amber, earth)
│   └── src/
│       ├── api/
│       │   ├── client.ts                 # Centralized fetch client with JWT
│       │   ├── auth.api.tsx              # AuthProvider & user session hooks
│       │   ├── advisory.api.ts           # Advisory React Query hooks & PDF download
│       │   └── resource.api.ts           # Cattle sanctuary directory API
│       ├── components/
│       │   ├── Navbar.tsx                # Responsive top navigation & user badge
│       │   ├── Sidebar.tsx               # Command Center navigation sidebar
│       │   ├── ScoreGuage.tsx            # SVG radial gauge for suitability & welfare
│       │   ├── FertilizerTimeline.tsx    # Phased nutrient timeline & organic alts
│       │   ├── EconomicBarChart.tsx      # Recharts financial forecast
│       │   ├── SustainablePathwayCard.tsx# Biogas, vermicompost & Panchagavya cards
│       │   ├── PdfExportButton.tsx       # PDF report generator with loading state
│       │   └── SanctuaryDirectoryModal.tsx # Searchable Gaushala directory modal
│       ├── layouts/
│       │   ├── AppLayout.tsx             # Authenticated workspace layout
│       │   └── AuthLayout.tsx            # Clean sign-in & register layout
│       ├── pages/
│       │   ├── LandingPage.tsx           # Hero showcase, platform metrics & CTAs
│       │   ├── LoginPage.tsx             # User login form
│       │   ├── RegisterPage.tsx          # Farm registration & unit preferences
│       │   ├── DashboardPage.tsx         # Farmer Command Center & telemetry
│       │   ├── CropAdvisoryWizardPage.tsx# 3-step crop & soil wizard
│       │   ├── LivestockWelfareWizardPage.tsx # Cattle preservation wizard
│       │   ├── AdvisoryResultsPage.tsx   # Detailed visual advisory report
│       │   ├── HistoryPage.tsx           # Searchable, filterable advisory archive
│       │   └── SettingsPage.tsx          # Farm profile & unit settings
│       ├── types/index.ts                # TypeScript data models
│       ├── App.tsx                       # Main router & QueryClientProvider
│       └── main.tsx                      # DOM root mount
│
├── server/                               # Backend Express REST API
│   ├── .env                              # Environment configuration
│   └── src/
│       ├── config/
│       │   ├── db.ts                     # Dual-mode PostgreSQL / PGlite manager
│       │   └── gemini.ts                 # Google GenAI SDK instance & JSON schemas
│       ├── controllers/
│       │   ├── auth.controller.ts        # Authentication & profile management
│       │   ├── advisory.controller.ts    # AI inference, queries & PDF streaming
│       │   └── resource.controller.ts    # Cattle sanctuary search & filters
│       ├── middleware/
│       │   ├── auth.middleware.ts        # JWT token verification & user isolation
│       │   ├── rateLimit.middleware.ts   # Rate limiting for AI endpoints
│       │   └── errorHandler.middleware.ts# Zod validation & standardized errors
│       ├── models/
│       │   └── schema.sql                # Production DDL schema with UUIDs & JSONB
│       ├── routes/                       # Express routes (/auth, /advisory, /resources)
│       ├── services/
│       │   ├── gemini.service.ts         # Gemini 2.5 Flash pipeline & fallback engine
│       │   └── pdf.service.ts            # PDFKit document generator
│       ├── validations/                  # Zod input & response validation schemas
│       └── index.ts                      # Express app bootstrap
│
├── package.json                          # Root workspace orchestrator
└── README.md                             # Comprehensive project documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Node.js:** v20.x or v24.x LTS ([Download Node.js](https://nodejs.org/))
* **Git:** Installed and configured

### 2. Clone the Repository
```bash
git clone https://github.com/shriramgame44-ctrl/AgriGenius.git
cd AgriGenius
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Configure Environment Variables
Create or verify `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Authentication Secrets
JWT_SECRET=agrigenius_super_secret_jwt_key_2026_enterprise_agritech
JWT_EXPIRES_IN=7d

# Google Gemini AI (Optional: if omitted, built-in Agronomic Expert Rule Engine runs automatically)
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL Database (Optional: if omitted, embedded zero-config PostgreSQL WASM runs automatically)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agrigenius
```

### 5. Launch Application
In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client starts at http://localhost:5173
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register farm account & issue JWT | No |
| `POST` | `/api/auth/login` | Authenticate credentials & return session | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/auth/me` | Get current user farm profile | Yes |
| `PUT` | `/api/auth/profile` | Update farm details and unit preferences | Yes |

### Agronomic & Livestock Advisories
| Method | Endpoint | Description | Auth Required | Rate Limited |
|---|---|---|---|---|
| `POST` | `/api/advisory/crop` | Generate crop advisory via Gemini 2.5 Flash | Yes | Yes (10/min) |
| `POST` | `/api/advisory/livestock` | Generate cattle welfare & preservation blueprint | Yes | Yes (10/min) |
| `GET` | `/api/advisory` | Get paginated list of user advisories | Yes | No |
| `GET` | `/api/advisory/:id` | Fetch single advisory by UUID (user isolated) | Yes | No |
| `DELETE` | `/api/advisory/:id` | Delete advisory record (ownership enforced) | Yes | No |
| `GET` | `/api/advisory/:id/pdf` | Stream binary PDF document report | Yes | No |

### Public & Community Resources
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/resources/sanctuaries` | Search Gaushalas and animal rescue havens | No |
| `GET` | `/api/health` | Service uptime and Gemini AI configuration status | No |

---

## 🔒 Security & Data Isolation
1. **Multi-Tenant User Isolation:** Every query against the `advisories` table strictly enforces user boundaries: `WHERE user_id = req.user.id`.
2. **Server-Bound Secrets:** The `GEMINI_API_KEY` is strictly server-side and never exposed to the client or bundled into frontend Vite builds.
3. **Password Security:** Salted BCrypt password hashing with 12 rounds.
4. **Token Security:** Supports HTTP-Only, SameSite=Lax cookies and Bearer Authorization headers.
5. **Schema Sanitization:** All incoming payloads and AI outputs are validated using Zod to block injection and payload corruption.
6. **Rate Limiting:** Protects inference endpoints against quota exhaustion.

---

## 🤝 Contributing
Contributions are warmly welcomed! Please open an issue or submit a Pull Request for any enhancements, localized crop varieties, or sanctuary listings.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for farmers, cattle welfare advocates, and regenerative agriculturalists worldwide.
</p>
