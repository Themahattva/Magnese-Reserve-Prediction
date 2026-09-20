# ANVESHA System Architecture & Implementation Reference
**Uncertainty-Aware AI/ML & Remote Sensing Platform for Manganese Exploration & Production**
*Developed for MOIL Limited (Miniratna CPSE, Ministry of Steel, Government of India)*

---

## 1. High-Level System Architecture

```
                                  ANVESHA PLATFORM ARCHITECTURE
                                  
   +─────────────────────────────────────────────────────────────────────────────+
   |                       DATA INGESTION & SATELLITE ENGINE                     |
   |  • Sentinel-2 MSI (Iron Oxide / Carbonate / Clay Mineral Spectral Indices)  |
   |  • PRISMA Hyperspectral Cubes (ASI VNIR/SWIR 239 Channels)                  |
   |  • GSI 1:50K Geological Stratigraphy (Sausar Group Gondite/Quartzite/Pelite)|
   |  • MOIL Core Borehole Database & Assay Logs (142 historical/active holes)   |
   |  • IMD Weather Stations Telemetry (Precipitation, Temperature, Moisture)    |
   |  • Mining SCADA Telemetry (Excavator/Dumper telemetry, blasting logs)       |
   +──────────────────────────────────────┬──────────────────────────────────────+
                                          │
                                          ▼
   +─────────────────────────────────────────────────────────────────────────────+
   |                          AI/ML & GEOSTATISTICAL CORE                        |
   |                                                                             |
   |  [Exploration & Prospectivity]             [Production Shortfall Risk]      |
   |  • Spatial Random Forest / Ensemble        • Physics-Informed XGBoost       |
   |  • Ordinary Kriging Variogram Fusion       • Weather Non-linear Splines     |
   |  • Bayesian Expected Info Gain (VoI)       • Equipment Bottleneck Analysis  |
   |  • 3D Block Geostatistical Interpolation   • Probabilistic Risk Calendar    |
   +──────────────────────────────────────┬──────────────────────────────────────+
                                          │
                                          ▼
   +─────────────────────────────────────────────────────────────────────────────+
   |                        DECISION CENTER & AUDIT ENGINE                       |
   |  • Human-in-the-Loop Review (Mandatory Sign-off Before Drilling / Dispatch) |
   |  • Bayesian VoI Ranking for Next-Best Borehole Locations                    |
   |  • Corrective Action Dispatch (Fleet reallocation, pre-blast buffering)     |
   |  • Cryptographically Traceable Audit Log (User, State Transition, Rationale)|
   +──────────────────────────────────────┬──────────────────────────────────────+
                                          │
                                          ▼
   +─────────────────────────────────────────────────────────────────────────────+
   |                          PRESENTATION TIER (UX4G 3.0)                       |
   |  • Next.js 16 (App Router) + React 19 + TypeScript + UX4G Web Components   |
   |  • Interactive Leaflet Map (Geological leases, polygons, boreholes)         |
   |  • Custom Canvas 3D Orebody Viewer (Voxel slicing, grade/probability color) |
   |  • Recharts Telemetry Trends, Shortfall Bars & What-If Scenario Simulators |
   |  • NeGD Accessibility Engine (WCAG 2.1 AA, Font Sizing, High Contrast)      |
   +─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Core Subsystems

### 2.1 Geospatial & Exploration Workspace (`/exploration`)
- **Interactive Lease Map:** Leaflet-powered GIS viewer centered across Nagpur, Bhandara, and Balaghat mining districts in Maharashtra and Madhya Pradesh.
- **Layer Control:** Dynamic toggle of reserve blocks, drill boreholes, inferred prospectivity contours, and high-uncertainty investigation grids.
- **Custom Canvas 3D Orebody Viewer (`Orebody3DViewer.tsx`):** High-performance 2.5D/3D isometric block renderer providing interactive mouse drag rotation, pitch control, depth-slicing sliders, attribute switching (inferred prospectivity, grade, uncertainty), and single-voxel inspection.
- **Active Exploration (Bayesian Value of Information):** Evaluates candidate drill locations by their expected reduction in geostatistical model uncertainty (KL-divergence / entropy reduction) per meter drilled.
- **Borehole & Chemical Assay Registry:** Detailed lithological logging (Gondite, Manganese Ore, Mica Schist, Quartzite) and assay concentrations (Mn%, Fe%, SiO2%, P%).

### 2.2 Operational Production & Shortfall Forecast (`/production`)
- **9-Mine Operational Telemetry:** Real-time production tracking across Dongri Buzurg, Balaghat, Chikla, Munsar, Kandri, Gumgaon, Parsioni, Sitapatore, and Tirodi.
- **Shortfall Forecaster:** Physics-informed machine learning regressor predicting deviations between monthly dispatch targets and actual yield.
- **IMD Weather Vulnerability:** Non-linear rainfall sensitivity modeling identifying critical precipitation thresholds (e.g., >25mm causing pit water accumulation and road traction loss).
- **Equipment Downtime Pareto:** Root-cause decomposition of haulage delays, crusher breakdowns, excavator servicing, and blasting delays.

### 2.3 Interactive What-If Scenario Simulator (`/predictions`)
- Calibrated against empirical MOIL mining physics.
- Enables operational planners to simulate perturbations in rainfall (mm), equipment availability (%), and blasting delays (hours) to observe dynamic changes in expected tonnage shortfall and probabilistic risk level.

### 2.4 Human-in-the-Loop Decision Center (`/decisions`)
- Section 3.2 compliance: **AI recommends, humans decide.**
- Drill site proposals and operational corrective actions cannot be dispatched automatically.
- Geological and operations engineers review model justifications, inspect satellite/geophysical evidence, and submit formal approvals or rejections recorded to the audit log.

### 2.5 Governance, Data Quality & Model Registry (`/data`, `/models`, `/reports`)
- **Data Source Registry:** Ingestion health and schema validity for Sentinel-2, PRISMA, GSI GIS shapefiles, assay logs, and SCADA feeds.
- **Model Registry & Drift Telemetry:** Version control, validation metrics (R², MAE, RMSE), and Population Stability Index (PSI) drift monitoring.
- **Immutable Audit Trail:** Downloadable audit dossiers with cryptographic event IDs, authorized user stamps, state transitions, and rationale.

---

## 3. Technology Stack & Dependencies

### Frontend
- **Framework:** Next.js 16.3.4 (App Router, Turbopack)
- **Runtime:** React 19.2.8 & React DOM 19
- **Design System:** UX4G 3.0 (`ux4g-web-components@2.1.0`), Noto Sans Typography, Vanilla CSS Variables
- **Mapping & GIS:** Leaflet 1.9.4 & React-Leaflet
- **Data Visualization:** Recharts 3.10.1 & HTML5 2D Canvas Engine
- **Icons:** Lucide-React

### Backend
- **Framework:** FastAPI 0.141.1 (Python 3.14 async runtime)
- **Data Persistence / Models:** SQLAlchemy 2.0.52 with `greenlet 3.5.6` async driver
- **Geostatistical & ML Simulation:** Physics-calibrated deterministic Sausar belt generators with fallback resiliency for headless or Docker-free environments.

---

## 4. Operational Execution & Run Commands

### 4.1 Starting the Frontend Server
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

### 4.2 Starting the Backend API Server
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Interactive Swagger Documentation: http://localhost:8000/docs
```

### 4.3 Verifying Builds and Test Suites
```bash
# Frontend Lint & Turbopack Production Build
npm --prefix frontend run lint
npm --prefix frontend run build

# Backend Endpoint Verification (24/24 HTTP 200)
backend/venv/bin/python -c "
import asyncio, httpx; from app.main import app
async def test():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url='http://test', follow_redirects=True) as c:
        for r in ['/', '/health', '/api/exploration/drill-candidates?mine_id=1', '/api/models/', '/api/audit/logs']:
            assert (await c.get(r)).status_code == 200
asyncio.run(test())
"
```
