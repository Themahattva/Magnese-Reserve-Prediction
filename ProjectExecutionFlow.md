# MOIL Execution Flow — Full Project Lifecycle

```mermaid
flowchart TD
    subgraph INGEST["Phase 1: Ingestion & Geospatial Sync"]
        S1["🛰️ Sentinel-2 MSI / Landsat TIRS"]
        S2["⛏️ Sub-surface Telemetry<br/>Core Logs / SCADA / Blasting"]
        S3["🌧️ IMD Rainfall / Weather Telemetry"]
        S4["🚚 HEMM & Pit SCADA<br/>Excavator / Dumper / Fuel"]
    end

    subgraph CLEAN["Phase 2: Data Pipeline & Feature Engineering"]
        C1["PostGIS ST_MakePoint<br/>EPSG:4326 Normalization"]
        C2["Chemical Assay Imputation<br/>BIS 11895 Outlier Rejection"]
        C3["Remote Sensing Band Math<br/>B4/B2 Iron Oxide, B11/B12 Clay, NDVI, NDMI"]
        C4["Compound Stress Ratios<br/>Stripping Ratio / Antecedent Rain / Fleet Availability"]
    end

    subgraph ML_CORE["Phase 3: AI/ML & Simulation Engine"]
        M1["3D Ordinary Kriging<br/>Spatial Ore Thickness & Grade (BLUE)"]
        M2["Random Forest Regressor<br/>Reserve Grade & Tonnage"]
        M3["XGBoost Shortfall Forecaster<br/>14-Day Risk & Deficit Tonnage"]
        M4["Physics-Informed Simulator<br/>Equipment Saturation / Flooding / Haul Drag / Muckpile"]
        M5["Decision Optimization Engine<br/>Net Recovery & Priority Weighting"]
    end

    subgraph DB["Persistence Layer"]
        D1["PostgreSQL 16 + PostGIS 3.4<br/>Spatial Geometries / Telemetry / ML Weights"]
    end

    subgraph OUTPUT["Phase 4: API Delivery & Client Execution"]
        O1["Next.js 15 + React 19 + Leaflet<br/>Dashboard / Reserve Map / Risk Calendar / Simulator / Advisor / Analytics / PDF Export"]
        O2["FastAPI Gateway<br/>/api/reserves /predictions /what-if /recommendations /satellite /production"]
    end

    subgraph EXEC_FLOW["Execution Lifecycle (Slide 5 Sequence)"]
        U["User: Mine Surveyor / GM"]
        UI["UI Layer"]
        API["FastAPI Backend"]
        ENGINE["Physics & ML Inference Core"]
    end

    %% Ingestion flows
    S1 --> C3
    S2 --> C2
    S3 --> C4
    S4 --> C4
    S1 --> C1
    S2 --> C1

    %% Cleaning to Models
    C1 --> M1
    C2 --> M1
    C3 --> M2
    C4 --> M3

    %% Models interact with DB
    M1 <--> D1
    M2 <--> D1
    M3 <--> D1
    M4 <--> D1
    M5 <--> D1

    %% Core to API / Execution
    M1 --> API
    M2 --> API
    M3 --> API
    M4 --> API
    M5 --> API

    API --> UI
    UI --> U

    %% Lifecycle sequence
    U --> UI
    UI --> API
    API --> ENGINE
    ENGINE --> API
    API --> UI
    UI --> U

    %% What-If simulation loop
    U -->|"Adjust Sliders<br/>Rain / Down / Delay / Night Shift"| UI
    UI -->|"POST /api/predictions/what-if"| API
    API --> M4
    M4 -->|"Adjusted Tonnes / Risk Tier"| API
    API --> UI

    %% Prescriptive loop
    U -->|"GET /api/recommendations"| UI
    UI --> API
    API --> M5
    M5 -->|"Ranked Action Cards"| API
    API --> UI
    UI -->|"Implement & Export Report"| U

    %% Data pipeline summary arrow
    CLEAN --> ML_CORE
    ML_CORE --> DB
    DB --> OUTPUT

    style INGEST fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style CLEAN fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style ML_CORE fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style DB fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style OUTPUT fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    style EXEC_FLOW fill:#e0f7fa,stroke:#006064,stroke-width:2px
```

## Key Phases Reference (from Presentation.md)

| Phase | Source Slide | Core Activity |
|---|---|---|
| **Ingestion** | Slide 5 / 6 | Satellite imagery + telemetry normalization into PostGIS |
| **Cleaning** | Slide 6 | Band math, assay imputation, compound stress ratios |
| **Kriging** | Slide 8 | 3D Ordinary Kriging for block grades / variograms |
| **Forecast** | Slide 9 | XGBoost / RF regressor: 14-day deficit prediction ($R^2$ 0.88–0.93) |
| **What-If** | Slide 10 | Physics-informed simulator (equipment saturation, flood thresholds, haul drag) |
| **Prescription** | Slide 11 | Prioritized action cards (redeployment, stockpile, rescheduling, maintenance, dewatering) |
| **Visualization** | Slide 12 | Leaflet 2.5D maps + thermal heatmaps + PDF export |
| **Deployment** | Slide 15 | Docker Compose (Next.js 3000 / FastAPI 8000 / PostgreSQL 16) |

---
*Derived from Presentation.md — Slides 4 (Architecture), 5 (Execution Lifecycle), 6 (Data Pipeline), 8–12 (Engines), 15 (Deployment).* | File: `ProjectExecutionFlow.md`
