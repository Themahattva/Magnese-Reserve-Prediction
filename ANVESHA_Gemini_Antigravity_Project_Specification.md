# ANVESHA — End-to-End Project Build Specification

## Uncertainty-Aware AI for Manganese Exploration & Production

**Target builder:** Gemini in Google Antigravity  
**Project type:** Full-stack AI/ML + geospatial mining decision-support
platform  
**Primary UX/UI system:** **UX4G Design System 3.0 — Government of
India**  
**Implementation principle:** UX4G is the authoritative source for the
interface system. Do not invent a separate visual design language.

------------------------------------------------------------------------

# 0. MASTER INSTRUCTION TO GEMINI ANTIGRAVITY

You are the principal software architect, ML engineer, GIS engineer,
backend engineer, frontend engineer, UX engineer and QA engineer
responsible for building the complete **ANVESHA** platform.

Treat this document as the implementation specification. Build
incrementally, stage by stage, while maintaining a runnable application
after every major stage.

## 0.1 Core product statement

ANVESHA is an uncertainty-aware mining intelligence platform for
manganese exploration and production planning. It combines satellite and
Earth-observation data, hyperspectral mineralogical indicators,
DEM/terrain information, geological information, borehole and assay
data, mine blocks, historical production, equipment telemetry, downtime,
blasting delays, weather, and mine targets.

The system must produce:

1.  Surface manganese prospectivity
2.  3D manganese probability distribution
3.  Grade / reserve estimates
4.  Prediction uncertainty
5.  Exploration / drilling priority
6.  Recommended next-drill locations
7.  Production-shortfall forecasts
8.  Shortfall root-cause analysis
9.  What-if operational scenarios
10. Recommended corrective actions
11. Human-review workflows
12. Audit-ready reports

## 0.2 Signature innovation — Active Exploration Engine

Do not build a dashboard that merely says where manganese may exist.
Build a system that answers:

> Given everything currently known, where should the next borehole be
> drilled to obtain the highest expected decision value, what
> uncertainty will it reduce, and how will new evidence update the 3D
> orebody model?

Exploration loop:

``` text
Satellite + Geology + Existing Boreholes
                ↓
        Multimodal Data Fusion
                ↓
        3D Orebody Model
                ↓
   Probability + Grade + Uncertainty
                ↓
       Active Exploration Engine
                ↓
     Optimal Next-Drill Location
                ↓
          New Borehole
                ↓
       New Assay / Geological Data
                ↓
       Model Update / Recalibration
                ↺
```

Production loop:

``` text
Operational Data + Weather + Equipment
                  ↓
          Production Forecast
                  ↓
       Shortfall Probability
                  ↓
          Root-Cause Analysis
                  ↓
           What-If Simulation
                  ↓
        Operational Optimization
                  ↓
        Corrective Action Plan
```

## 0.3 Scientific-integrity rule

Do not fabricate scientific outputs merely to make the dashboard look
impressive. If real mining data is unavailable, provide a clearly
labelled demo/simulation mode with documented assumptions. Never label
synthetic predictions as actual mine measurements.

------------------------------------------------------------------------

# 1. NON-NEGOTIABLE UX/UI REQUIREMENT — UX4G

The entire user interface must be based on the **UX4G Design System 3.0
of Government of India**. This applies to layout, navigation,
typography, colours, buttons, forms, cards, alerts, badges, breadcrumbs,
tabs, modals, tables, pagination, spacing, focus states, accessibility,
responsive behaviour, content hierarchy, interaction states, loading
states, error states, empty states, confirmation states and status
communication.

Do not create a competing design system.

Do not use glassmorphism, neon UI, excessive gradients, futuristic
sci-fi panels, arbitrary rounded cards, arbitrary shadows, custom button
styles, arbitrary typography, decorative SaaS dashboard patterns, or
unrelated visual templates.

Tailwind may be used only as an implementation utility if absolutely
necessary; it must not become the visual design system.

## 1.1 Official UX4G references

Use the current official UX4G documentation as the source of truth:

- https://www.ux4g.gov.in/
- https://doc.ux4g.gov.in/
- https://www.ux4g.gov.in/foundations
- https://www.ux4g.gov.in/components
- https://www.ux4g.gov.in/foundations/accessibility
- https://www.ux4g.gov.in/resources/ux-handbook
- https://www.ux4g.gov.in/resources/theme-craft
- https://www.ux4g.gov.in/get-started/for-developers

If a UI decision is uncertain, consult UX4G before inventing a solution.

------------------------------------------------------------------------

# 2. PRODUCT IDENTITY

**Name:** ANVESHA  
**Descriptor:** Uncertainty-Aware AI for Manganese Exploration &
Production  
**Category:** Mining Intelligence / Geospatial AI / Decision Support
System

Primary users:

- Exploration Geologist
- Mine Planning Engineer
- Operations Manager
- Mining / Technical Decision Maker
- Data / ML Engineer

Do not use Government of India emblems, ministry logos, MOIL logos or
official seals unless legally authorized. UX4G usage does not itself
grant branding authorization.

------------------------------------------------------------------------

# 3. UX4G DESIGN FOUNDATION

## 3.1 UX4G integration

Use the official UX4G web package and current developer instructions.
For React/Next.js, follow the current documented integration pattern,
including the UX4G stylesheet and design-system runtime.

Use UX4G CSS custom properties/tokens wherever available, including the
documented colour, typography, spacing, shadow and radius tokens. Do not
copy token values into arbitrary local CSS when the official token
exists.

## 3.2 Visual language

Use the default UX4G visual language. The current developer
documentation identifies the primary token as `--ux4g-primary: #4A2BC2`.
Do not replace UX4G’s primary visual language with mining-themed orange,
gold, black, neon green or sci-fi colours.

Use semantic UX4G status colours. Never rely on colour alone.

## 3.3 Typography

Use UX4G typography. Current Theme Craft documentation uses:

``` text
Body:    "Noto Sans", system-ui, sans-serif
Display: "Noto Sans Display", "Noto Sans", sans-serif
```

Use semantic HTML (`h1`–`h6`, `p`, `label`, `button`, `nav`, `main`,
`section`, `table`). Prefer sentence case for buttons, labels,
navigation and table headers.

## 3.4 Spacing and layout

Use the UX4G base-4 spacing system and responsive grid. Do not create a
second spacing system or arbitrary pixel values when an equivalent UX4G
token/utility exists.

Build mobile-first and support mobile, tablet, laptop, desktop and large
desktop.

------------------------------------------------------------------------

# 4. UX4G COMPONENT MAPPING

Use official UX4G components whenever the requirement maps to one.

| ANVESHA requirement      | UX4G component/pattern        |
|--------------------------|-------------------------------|
| Global navigation        | Navbar                        |
| Current location         | Breadcrumb                    |
| Dashboard summaries      | Card                          |
| Status                   | Badge                         |
| System messages          | Alert                         |
| Confirmation             | Modal                         |
| Secondary navigation     | Nav / Tabs                    |
| Mobile navigation        | Offcanvas / responsive Navbar |
| Dataset table            | Table                         |
| Large dataset navigation | Pagination                    |
| Expandable details       | Accordion / Collapse          |
| Actions                  | Button                        |
| Action grouping          | Button Group                  |
| Selection                | Dropdown / form controls      |
| Forms                    | UX4G form controls            |
| Search                   | Form input + search pattern   |
| Drill details            | Card / Table / Modal          |
| Model status             | Badge + Alert                 |
| Navigation hierarchy     | Navbar + Breadcrumb           |

Do not invent a component when UX4G already provides the interaction.

------------------------------------------------------------------------

# 5. ACCESSIBILITY — MANDATORY

Target **WCAG 2.1 AA**, consistent with UX4G.

Every interactive element must be keyboard accessible, have visible
focus, have a meaningful accessible name, use correct semantic roles,
support screen readers, maintain sufficient contrast, remain usable with
text enlargement, and work at narrow widths.

Never communicate meaning through colour alone. For example, do not make
red alone mean high risk; display the words `High risk` and optionally
an icon as well.

Implement the UX4G accessibility bar/accessibility controls where
appropriate, including skip-to-main behaviour and
text-resize/accessibility features supported by UX4G.

Every icon-only control needs a descriptive accessible label.

------------------------------------------------------------------------

# 6. INFORMATION ARCHITECTURE

``` text
Dashboard
│
├── Exploration
│   ├── Prospectivity Map
│   ├── 3D Orebody
│   ├── Boreholes
│   ├── Assays
│   ├── Uncertainty
│   └── Active Exploration
│
├── Production Intelligence
│   ├── Forecast
│   ├── Shortfall Risk
│   ├── Root Cause
│   └── What-if Scenarios
│
├── Operations
│   ├── Equipment
│   ├── Downtime
│   ├── Blasting
│   ├── Weather
│   └── Production
│
├── Decision Center
│   ├── Drill Recommendations
│   ├── Corrective Actions
│   ├── Scenario Comparison
│   └── Approvals
│
├── Data
│   ├── Data Sources
│   ├── Data Quality
│   ├── Uploads
│   └── Processing Jobs
│
├── Models
│   ├── Model Registry
│   ├── Performance
│   ├── Drift
│   └── Retraining
│
└── Reports
    ├── Exploration Report
    ├── Production Report
    ├── Decision Report
    └── Audit Log
```

------------------------------------------------------------------------

# 7. GLOBAL APPLICATION SHELL

Authenticated pages should follow:

``` text
Accessibility Bar
        ↓
UX4G Navbar
        ↓
Breadcrumb
        ↓
Page heading
        ↓
Page description / context
        ↓
Page content
        ↓
Contextual actions
        ↓
Footer / system information
```

Navbar: ANVESHA identity, primary navigation, current section, global
search if needed, user/session area, accessibility access. Use
`aria-current` correctly.

Breadcrumb example:

``` text
Home / Exploration / Active Exploration / Drill Site 17
```

Page header should contain an H1, short explanation, and one primary
contextual action where relevant.

------------------------------------------------------------------------

# 8. DASHBOARD

The dashboard must answer:

1.  What is happening now?
2.  Where is the geological opportunity?
3.  Where is uncertainty highest?
4.  Is production at risk?
5.  Why is it at risk?
6.  What should the user review next?

Structure:

``` text
Page Header
↓
Mine / Date / Data freshness filters
↓
Key operational metrics
↓
Exploration intelligence
↓
Production intelligence
↓
Decision recommendations
↓
Data/model health
```

Use UX4G Cards for concise summaries. Possible metrics include
prospectivity, high-confidence area, forecast production, shortfall
probability, high-uncertainty zones and pending decisions. Values must
come from data or be clearly synthetic demo data.

------------------------------------------------------------------------

# 9. EXPLORATION MODULE

## 9.1 Prospectivity Map

Layers:

- base map
- mine boundary
- block boundaries
- boreholes
- surface geology
- satellite-derived indicators
- hyperspectral indicators
- prospectivity
- uncertainty
- recommended drill sites

Users must be able to zoom, pan, select blocks/boreholes, inspect
layers, filter probability/uncertainty, inspect candidate sites, view
evidence and coordinates.

Use UX4G components for map controls, filters, buttons, dialogs, panels
and status indicators. The map itself is a specialist visualization
surface.

## 9.2 Prospectivity legend

Use descriptive categories with text and numeric ranges, for example:

``` text
Very low
Low
Moderate
High
Very high
No data
```

Do not use red/green alone.

------------------------------------------------------------------------

# 10. 3D OREBODY MODEL

Scientific framing must be:

``` text
Surface Earth-observation indicators
+
Geology
+
Borehole observations
+
Assays
+
Geostatistical modelling
+
Machine learning
=
3D inferred manganese prospectivity
```

Never claim satellites directly detect underground manganese.

3D view should support terrain, mine boundary, boreholes, assay
intervals, estimated grade, probability volume, uncertainty volume,
selected block and recommended drilling points.

Selected block information should include block ID, grade, reserve,
probability, uncertainty, supporting boreholes, nearest borehole,
surface spectral evidence, geological evidence and recommendation.

------------------------------------------------------------------------

# 11. UNCERTAINTY ENGINE

This is a core differentiator.

Never show only `Probability = 84%`. Show probability, uncertainty
level, confidence/evidence coverage and supporting observations.

Example:

``` text
Probability 84%
Uncertainty Low
Confidence High
Supporting boreholes 7
Evidence coverage Good
```

Provide a dedicated uncertainty map. Thresholds must be configurable and
documented rather than treated as universal statistical truths.

------------------------------------------------------------------------

# 12. ACTIVE EXPLORATION ENGINE

## 12.1 Objective

Recommend where the next borehole should be drilled.

## 12.2 Candidate scoring inputs

Consider:

- expected mineralization probability
- expected grade
- uncertainty reduction
- expected information gain
- geological consistency
- existing borehole coverage
- accessibility
- estimated drilling cost
- operational constraints

Document the formula. Do not create an unexplained arbitrary score.

## 12.3 Recommendation UI

Example:

``` text
Recommended drill site
Site ID: DR-017
Priority: High
Estimated Mn probability: 78%
Expected grade: 31.4%
Uncertainty: High
Expected uncertainty reduction: 24%
Estimated drilling cost: [value]
Accessibility: Moderate
Primary reason: High prospectivity combined with high uncertainty and strong geological support.
Action: Review for drilling approval
```

Values above are illustrative only.

## 12.4 Value of Information

For each candidate show:

- expected information gain
- expected reserve upside
- estimated drilling cost
- operational risk
- accessibility
- decision value

Use the term `Value of Information` or a documented equivalent rather
than an unexplained black-box score.

------------------------------------------------------------------------

# 13. BOREHOLE AND ASSAY MANAGEMENT

Borehole table columns:

``` text
Borehole ID
Block
Depth
Mn %
Fe %
SiO2 %
P %
Density
Status
Last updated
Action
```

Use UX4G Table with filtering, sorting, pagination and row actions.

Borehole detail tabs:

``` text
Overview
Lithology
Assay
Depth profile
Model contribution
Nearby predictions
Audit history
```

Assay schema should include sample ID, borehole ID, depth interval,
Mn/Fe/SiO2/P, density, date, laboratory and quality status.

Quality statuses:

``` text
Valid
Needs review
Rejected
Missing
```

------------------------------------------------------------------------

# 14. PRODUCTION INTELLIGENCE

Forecast horizons must be explicit, such as 24 hours, 72 hours, 7 days
or 30 days.

Show:

``` text
Actual production
Forecast production
Target production
Prediction interval
Shortfall probability
```

Example values are illustrative and must not be presented as real mine
data.

Risk levels can be:

``` text
Low
Moderate
High
Critical
```

Thresholds must be configurable and documented.

------------------------------------------------------------------------

# 15. ROOT-CAUSE ANALYSIS

Prediction is not enough. Show model contribution factors,
e.g. equipment downtime, blasting delay, rainfall, crusher availability
and other factors.

Use SHAP or an appropriate explanation method where justified.

Important wording rule: SHAP/model explanations describe model
contribution; they do not automatically establish physical causality.
Use `Model contribution`, not `Causal effect`, unless causal modelling
is actually implemented.

------------------------------------------------------------------------

# 16. WHAT-IF SIMULATION

Users must be able to change operational decisions and compare predicted
outcomes.

Example structure:

``` text
Current plan → Forecast
Scenario A: Redeploy excavator → Forecast
Scenario B: Redeploy + blast resequencing → Forecast
Scenario C: Redeploy + blast resequencing + stockpile buffer → Forecast
```

Never fabricate scenario results. Use an actual model or clearly
labelled simulation logic.

Scenario table:

``` text
Scenario
Actions
Expected production
Expected shortfall
Risk
Operational cost
Constraints
```

Use UX4G Table and Card patterns.

------------------------------------------------------------------------

# 17. DECISION CENTER AND HUMAN-IN-THE-LOOP

The Decision Center converts analytics into reviewable decisions.

Required workflow:

``` text
AI recommendation
↓
Evidence review
↓
Human reviewer
↓
Approve / Reject / Request review
↓
Decision recorded
```

Recommendation statuses:

``` text
Pending review
Under review
Approved
Rejected
Needs more evidence
Executed
Archived
```

Every recommendation must show evidence, uncertainty, expected impact,
constraints, reviewer and timestamp.

No critical drilling or operational recommendation should silently
become an executed action.

------------------------------------------------------------------------

# 18. DATA MODULE

Data source registry fields:

``` text
Source
Type
Coverage
Last update
Quality
Status
```

Categories:

``` text
Satellite
Hyperspectral
Geological
Borehole
Assay
Production
Equipment
Weather
Operational
```

Data quality dashboard should show completeness, freshness, validity,
spatial coverage, temporal coverage, duplicates, missing values and
outliers.

------------------------------------------------------------------------

# 19. MODEL REGISTRY

Expose:

``` text
Model name
Version
Purpose
Training date
Validation date
Dataset version
Metrics
Status
Drift status
Approval status
```

Models include orebody/reserve, prospectivity, production forecast,
explainability, active exploration and scenario models.

Do not silently deploy a newly trained model.

------------------------------------------------------------------------

# 20. ML ARCHITECTURE

Keep the architecture deep but not unnecessarily complicated.

## 20.1 Reserve / orebody

``` text
Borehole + assay data
+
Geospatial features
+
Satellite / hyperspectral features
↓
Feature engineering
↓
Geostatistical estimate
+
Nonlinear ML estimate
↓
Fusion / calibration
↓
3D prospectivity + grade + uncertainty
```

Candidate methods: 3D Ordinary Kriging or appropriate geostatistics,
XGBoost, and Random Forest only where justified. Avoid algorithm
stuffing.

## 20.2 Production forecast

Primary model: XGBoost Regressor.

Inputs can include historical production, target quota, equipment
availability, downtime, fuel, rainfall, temperature, humidity, blasting
delay, mine type, season, stockpile and shift information.

## 20.3 Risk classification

Use a classifier only if it adds real value; XGBoost Classifier is an
option. Alternatively derive risk from forecast
distributions/uncertainty.

## 20.4 Explainability

Use SHAP or equivalent where appropriate, and clearly distinguish
prediction explanation from physical causality.

------------------------------------------------------------------------

# 21. ACTIVE EXPLORATION ALGORITHM

Implement in stages:

### A — Candidate generation

Generate candidates from high prospectivity, high uncertainty, spatial
gaps and geological constraints.

### B — Constraint filtering

Remove points violating mine boundaries, inaccessible terrain,
prohibited zones, existing-borehole proximity rules or engineering
constraints.

### C — Decision value

Estimate expected information gain + expected geological value −
drilling cost − operational risk.

### D — Ranking

Produce model-ranked candidate sites. Label the result as model-ranked,
not as an absolute universal truth.

### E — Human review

Require review before operational use.

------------------------------------------------------------------------

# 22. DIGITAL MINE TWIN

Organize the platform around four layers:

``` text
LAYER 1 — SURFACE
Satellite / Hyperspectral / DEM / Terrain / Weather

LAYER 2 — SUBSURFACE
Boreholes / Assays / Geology / Block model / Ore probability / Uncertainty

LAYER 3 — OPERATIONS
Equipment / Production / Downtime / Blasting / Stockpile / Weather

LAYER 4 — INTELLIGENCE
Prediction / Uncertainty / Drill recommendation / Shortfall risk / Scenario simulation / Corrective action
```

The UI should allow movement between these layers without losing
context.

------------------------------------------------------------------------

# 23. GEOSPATIAL ARCHITECTURE

Backend tools:

``` text
PostgreSQL
PostGIS
GeoPandas
Rasterio
Shapely
PyProj
```

Store explicit CRS metadata. Do not assume EPSG:4326 is always suitable
for local distance/area calculations. Use an appropriate projected CRS
for calculations and retain source CRS information.

Preserve:

``` text
raw raster
processed raster
derived features
model-ready features
```

Never overwrite raw source data.

------------------------------------------------------------------------

# 24. EARTH OBSERVATION

Use satellite/hyperspectral data as surface evidence.

Potential inputs:

### Sentinel-2

Multispectral surface indicators, exposed geology/context, vegetation
masking, moisture/context and spectral indices.

### PRISMA / EnMAP

Hyperspectral mineralogical indicators, alteration mapping and surface
mineral composition where data are available.

### DEM

Elevation, slope, aspect, terrain constraints and accessibility.

### Weather

Rainfall, temperature, humidity and weather events.

Never claim satellite imagery directly detects subsurface manganese.

------------------------------------------------------------------------

# 25. DATA PIPELINE

``` text
DATA SOURCE
↓
INGESTION
↓
VALIDATION
↓
QUALITY CONTROL
↓
NORMALIZATION
↓
SPATIAL ALIGNMENT
↓
FEATURE EXTRACTION
↓
FEATURE STORE
↓
MODEL
↓
PREDICTION
↓
UNCERTAINTY
↓
DECISION ENGINE
```

Each stage must produce logs and version information.

------------------------------------------------------------------------

# 26. BACKEND ARCHITECTURE

Preferred stack:

``` text
FastAPI
PostgreSQL/PostGIS
Python ML services
Object storage
Background workers
Redis if genuinely needed
```

Suggested API modules:

``` text
auth
mines
exploration
boreholes
assays
maps
production
equipment
forecasts
recommendations
scenarios
reports
models
data-quality
audit
```

A modular monolith is acceptable for the first complete prototype. Do
not split into microservices prematurely.

------------------------------------------------------------------------

# 27. API DESIGN

Use REST + OpenAPI.

Core endpoints:

``` text
GET  /api/mines
GET  /api/mines/{mine_id}
GET  /api/exploration/prospectivity
GET  /api/exploration/uncertainty
GET  /api/exploration/drill-candidates
GET  /api/boreholes
GET  /api/boreholes/{id}
GET  /api/production/forecast
GET  /api/production/shortfall-risk
GET  /api/production/root-causes
POST /api/scenarios
POST /api/scenarios/simulate
GET  /api/recommendations
POST /api/recommendations/{id}/approve
POST /api/recommendations/{id}/reject
GET  /api/models
GET  /api/models/{id}
GET  /api/data-quality
GET  /api/audit
```

Every endpoint must validate inputs and return structured errors.

------------------------------------------------------------------------

# 28. DATABASE DESIGN

Minimum entities:

``` text
users
roles
mines
mine_blocks
boreholes
borehole_intervals
assays
geology
satellite_scenes
hyperspectral_scenes
terrain_layers
weather_observations
equipment
equipment_events
production_records
blasting_events
stockpiles
features
model_versions
predictions
uncertainty_records
drill_candidates
recommendations
scenarios
scenario_results
approvals
audit_logs
data_quality_reports
processing_jobs
```

Use foreign keys, indexes and timestamps. Where relevant, store
`created_at`, `updated_at`, `created_by`, `updated_by`.

------------------------------------------------------------------------

# 29. AUTHENTICATION AND RBAC

Roles:

``` text
Administrator
Exploration Geologist
Mine Planning Engineer
Operations Manager
Technical Reviewer
Data Scientist
Viewer
```

Permissions must control data upload, model execution, recommendation
approval, report generation, configuration, model deployment and user
administration.

Frontend hiding is not sufficient; backend authorization is mandatory.

------------------------------------------------------------------------

# 30. AUDITABILITY

Log critical actions:

``` text
user
timestamp
action
entity
previous state
new state
reason
model version
data version
```

Example:

``` text
User: reviewer_01
Action: Approved drill recommendation
Recommendation: DR-017
Model: exploration-v1.4
Data: dataset-2026-09-18
Reason: Geological evidence reviewed
```

------------------------------------------------------------------------

# 31. REPORTING

### Exploration report

Include mine, period, data sources, prospectivity, uncertainty,
boreholes, recommended drill sites, methodology, model version,
limitations and reviewer.

### Production report

Include target, actual, forecast, shortfall probability, contributing
model factors, scenarios, actions and reviewer.

### Decision report

Include recommendation, evidence, uncertainty, approval, action, result
and audit trail.

------------------------------------------------------------------------

# 32. UI STATES — EVERY SCREEN MUST HAVE THEM

Every major screen/component must support:

``` text
Loading
Loaded
Empty
Error
Partial data
No permission
Stale data
Offline / unavailable
Success
```

Example empty state:

``` text
No drill recommendations available

The exploration engine has not generated a recommendation for the selected mine and analysis period.

[Run analysis]
```

Use UX4G-compatible feedback components.

------------------------------------------------------------------------

# 33. ERROR AND LOADING UX

Errors must explain what happened and what the user can do.

Example:

``` text
We could not load the prospectivity layer.

The map service did not return valid data.

Try again or contact the system administrator.

[Try again]
```

For long jobs, show meaningful progress:

``` text
Processing satellite imagery
Step 2 of 5

✓ Data downloaded
✓ Cloud masking
→ Spectral feature extraction
○ Model inference
○ Map generation
```

Do not show fake percentage progress when progress is not measurable.

------------------------------------------------------------------------

# 34. DATA FRESHNESS

Make freshness explicit:

``` text
Production data — Updated 14 minutes ago
Weather data — Updated 42 minutes ago
Satellite layer — Acquired 18 Sep 2026; Processed 19 Sep 2026
```

Do not call a dataset `Live` unless it is genuinely live.

------------------------------------------------------------------------

# 35. MODEL GOVERNANCE AND DRIFT

Model lifecycle:

``` text
Candidate model
↓
Validation
↓
Technical review
↓
Approval
↓
Deployment
↓
Monitoring
↓
Rollback if required
```

Use controlled periodic retraining with drift monitoring, validation,
approval, versioning and rollback.

Monitor:

- feature drift
- prediction drift
- error drift
- data completeness drift
- sensor behaviour
- seasonal changes

Statuses:

``` text
Healthy
Monitor
Review required
Critical
```

------------------------------------------------------------------------

# 36. FRONTEND STACK

Preferred:

``` text
Next.js
React
TypeScript
UX4G Design System 3.0
```

Optional utilities may be used for maps, charts, state and data
fetching, but UX4G remains the interface authority.

Potential libraries:

``` text
TanStack Query
Zustand or Redux Toolkit if needed
MapLibre GL JS or equivalent
Plotly / ECharts or equivalent
```

Do not add dependencies without justification.

------------------------------------------------------------------------

# 37. VISUALIZATION RULES

Charts are analytical visualization surfaces, not a replacement for
UX4G.

Every chart needs a title, units, axes, accessible text summary,
responsive behaviour and a legend where required. Do not use colour as
the sole encoding.

Example:

``` text
Production forecast — next 7 days
Unit: tonnes
Actual | Forecast | Target | Prediction interval
```

Provide a short textual interpretation alongside important charts.

------------------------------------------------------------------------

# 38. MAP LEGEND RULES

Every map layer must expose:

``` text
Layer name
Units
Classification
Date
Source
No-data definition
```

Example prospectivity scale:

``` text
0–20%   Very low
20–40%  Low
40–60%  Moderate
60–80%  High
80–100% Very high
```

Thresholds are configurable, not universal truths.

------------------------------------------------------------------------

# 39. PAGE-BY-PAGE BUILD SPECIFICATION

## Login

Accessibility controls, ANVESHA identity, heading, username/email,
password, sign-in and help.

## Dashboard

Mine selector, analysis period, KPI cards, prospectivity snapshot,
uncertainty snapshot, production forecast, shortfall risk,
recommendations and model/data freshness.

## Exploration overview

Map, filters, legend, prospectivity, uncertainty, boreholes and
candidates.

## Prospectivity map

Full exploration map with evidence panel.

## 3D orebody

Interactive 3D geological view.

## Boreholes

Table, filters and pagination.

## Borehole detail

Tabs: Overview, Lithology, Assay, Depth, Model evidence, History.

## Active exploration

Candidate drill locations and review workflow.

## Drill recommendation detail

Site, probability, grade, uncertainty, evidence, information gain, cost,
accessibility, rationale and approval.

## Production forecast

Actual, target, forecast, prediction interval and shortfall probability.

## Shortfall analysis

Risk, model contributions, equipment, weather and blasting.

## What-if simulation

Editable scenario inputs, simulation, comparison table and review
action.

## Decision center

Pending reviews, recommendations, approvals and actions.

## Data quality

Source health, completeness, freshness, validation and processing jobs.

## Model registry

Versions, metrics, drift, approval and deployment state.

## Reports

Report type, date, status, generate/download action.

## Audit log

User, action, object, timestamp, model version and reason.

------------------------------------------------------------------------

# 40. UX4G INTERACTION RULES

### Buttons

Use UX4G button variants. Establish a clear primary action per context
and avoid giving every action equal visual prominence.

### Cards

Use cards for structured summaries. Do not turn every UI element into a
card.

### Tables

Use tables for structured records. Do not convert data tables into
decorative cards.

### Tabs

Use tabs for related content at the same hierarchy level.

### Modals

Use modals for focused confirmations and short decisions. Do not put
complex workflows inside modals. Do not nest modals.

### Alerts

Use alerts for contextual system feedback, not decoration.

------------------------------------------------------------------------

# 41. SEARCH AND FILTERING

Global search should support:

``` text
Borehole ID
Block ID
Mine
Drill recommendation
Scenario
Report
Model
```

Filters should be clearly labelled, keyboard accessible, resettable, and
reflected in page state.

Common filters:

``` text
Mine
Block
Date
Probability
Uncertainty
Grade
Risk
Equipment
Status
Data source
Model version
```

Provide a `Clear filters` action when filters are active.

------------------------------------------------------------------------

# 42. RESPONSIVE DESIGN

Mobile prioritizes page title, primary action, key status, key metric
and critical alerts. Large tables must have an accessible responsive
treatment. Desktop may use map + information panel and multi-column
analytics, but readability must not be sacrificed.

------------------------------------------------------------------------

# 43. CONTENT DESIGN

Use clear, government-service-style language.

Prefer:

``` text
Review recommendation
Model contribution
Estimated reserve
Inferred subsurface prospectivity
```

over:

``` text
Execute AI recommendation
AI says this caused the problem
Exact reserve
Satellite-detected underground manganese
```

The system must communicate uncertainty honestly.

------------------------------------------------------------------------

# 44. DEMO DATA MODE

Implement a clearly labelled `Demo / synthetic data` mode containing
realistic synthetic mine boundaries, blocks, boreholes, assays,
prospectivity, uncertainty, production, equipment, weather, blasting and
recommendations.

Use a neutral internal demo identifier such as `Demo Mine A`. Do not
imply synthetic values are actual measurements from a named mine.

Build `scripts/generate_demo_data.py` with a reproducible random seed.

------------------------------------------------------------------------

# 45. MODEL DEVELOPMENT MODES

Support:

``` text
DEMO MODEL
REAL MODEL
```

Demo models must be deterministic and fast. Real models must be
versioned and loaded from the model registry.

Every prediction should include:

``` json
{
  "prediction": {},
  "uncertainty": {},
  "model_version": "",
  "data_version": "",
  "generated_at": "",
  "explanation": {},
  "status": ""
}
```

------------------------------------------------------------------------

# 46. PROJECT STRUCTURE

``` text
anvesha/
├── apps/
│   ├── web/
│   └── api/
├── ml/
│   ├── exploration/
│   ├── production/
│   ├── uncertainty/
│   ├── explainability/
│   ├── active_exploration/
│   └── scenarios/
├── data/
│   ├── demo/
│   ├── raw/
│   ├── processed/
│   └── features/
├── database/
│   ├── migrations/
│   └── seeds/
├── scripts/
├── docs/
├── tests/
├── docker/
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

Frontend:

``` text
apps/web/
├── app/
├── components/
│   ├── ux4g/
│   ├── layout/
│   ├── maps/
│   ├── charts/
│   ├── exploration/
│   ├── production/
│   └── decisions/
├── lib/
├── hooks/
├── types/
└── styles/
```

Backend:

``` text
apps/api/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── workers/
│   └── main.py
└── tests/
```

------------------------------------------------------------------------

# 47. STAGE-WISE IMPLEMENTATION PLAN

Do not attempt to build the entire application in one pass.

## STAGE 0 — Repository and requirements

Create repository, monorepo structure, README, `.env.example`,
architecture, database schema, API contract, UX4G rules, demo data
strategy and testing strategy.

Deliverables:

``` text
Repository
Architecture document
Database ERD
API contract
UX4G compliance checklist
```

## STAGE 1 — UX4G foundation

Initialize Next.js + TypeScript, integrate UX4G 3.0, establish token
usage, typography, global layout, Navbar, Accessibility Bar, Breadcrumb,
responsive shell, focus behaviour, keyboard navigation and reusable UX4G
wrappers.

Acceptance: UX4G renders correctly; keyboard navigation works;
responsive shell works; accessibility checks pass; no competing visual
system.

## STAGE 2 — Authentication and RBAC

Implement login, sessions, roles, permissions, protected routes, access
denied and session expiry. Backend must enforce authorization.

## STAGE 3 — Database and demo data

PostgreSQL + PostGIS, migrations, seed data, reproducible generator,
indexes and spatial indexes.

## STAGE 4 — Core API

Build mines, blocks, boreholes, assays, production, equipment and
weather APIs with validation, pagination, filtering, sorting, structured
errors and OpenAPI documentation.

## STAGE 5 — Dashboard

Build functional dashboard with UX4G Cards, selectors, freshness,
prospectivity, uncertainty, production and recommendations.

## STAGE 6 — GIS exploration

Build map, boundaries, blocks, boreholes, prospectivity, uncertainty,
drill candidates, legend, layers and evidence panel.

## STAGE 7 — 3D orebody

Build terrain, boreholes, probability volume, uncertainty, selected
block and drill candidates. Keep data synchronized with the 2D
exploration view.

## STAGE 8 — Exploration ML

Implement feature extraction, geostatistical estimate, ML estimate,
fusion/calibration, probability, grade and uncertainty. Store model/data
versions.

## STAGE 9 — Active exploration

Implement candidate generation, constraints, information gain, expected
value, cost, ranking, recommendation and human review.

## STAGE 10 — Production intelligence

Implement production forecast, shortfall probability/risk and
model-contribution explanations.

## STAGE 11 — What-if engine

Implement baseline, scenario inputs, simulation, comparison and review.

## STAGE 12 — Decision Center

Implement drilling and operational recommendations, approvals,
rejection, review and audit logging.

## STAGE 13 — Data quality and model governance

Implement data-quality dashboard, model registry, drift monitoring,
model approval, versioning and rollback.

## STAGE 14 — Reporting

Implement exploration, production, decision and audit reports with
data/model versions and limitations.

## STAGE 15 — Security hardening

Run dependency audit, secret scan, API security, RBAC, upload
validation, injection/XSS tests, authentication and authorization tests.

## STAGE 16 — UX4G audit

Audit every screen against UX4G foundations, components, accessibility
and content guidance. Target UX4G deviation = 0 except justified
specialist visualization needs.

------------------------------------------------------------------------

# 48. SECURITY

Minimum requirements:

- secure authentication
- secure password handling where passwords are used
- RBAC
- input validation
- SQL injection protection
- secure file upload validation
- rate limiting
- audit logs
- secret management
- environment variables
- HTTPS in deployment
- CORS configuration
- secure session/token handling
- no API keys in frontend

Never commit secrets.

------------------------------------------------------------------------

# 49. TESTING

Frontend: Vitest/Jest, React Testing Library, Playwright and axe where
appropriate.

Backend: pytest.

ML: preprocessing, feature schema, model loading, inference, output
schema, uncertainty and reproducibility tests.

Test loading, empty, error, permission, stale-data and success states,
not just the happy path.

------------------------------------------------------------------------

# 50. PERFORMANCE AND OBSERVABILITY

Measure actual performance instead of inventing targets.

Measure:

``` text
API latency
map load time
database query time
model inference time
3D rendering performance
page load
bundle size
```

Use structured logs containing timestamp, service, request ID, action,
status, duration and error. Monitor API failures, job failures, ML
failures, stale data and processing failures.

------------------------------------------------------------------------

# 51. DOCUMENTATION

Create:

``` text
README.md
ARCHITECTURE.md
UX4G.md
API.md
DATABASE.md
ML.md
GIS.md
DEPLOYMENT.md
SECURITY.md
DEMO_MODE.md
TESTING.md
```

`UX4G.md` must document the installed UX4G version, components used,
tokens used, accessibility implementation and any deviations.

Create `docs/UX4G_DEVIATIONS.md`. Every deviation must record the
component, reason UX4G could not be used, alternative, accessibility
mitigation and approval.

------------------------------------------------------------------------

# 52. SCIENTIFIC AND PRODUCT INTEGRITY

Never imply certainty where none exists. Use words such as `estimated`,
`predicted`, `inferred`, `model-ranked`, `model contribution`, and
`uncertainty`.

Do not use `guaranteed`, `exact`, `certain`, `AI proved`, or equivalent
overclaims.

Satellite data is surface evidence. Use this framing:

> Satellite-derived surface indicators contribute evidence to the
> inferred subsurface prospectivity model.

Boreholes and assays remain critical evidence for subsurface modelling.

------------------------------------------------------------------------

# 53. FINAL END-TO-END USER JOURNEY

``` text
Login
 ↓
Dashboard
 ↓
Select mine
 ↓
Exploration
 ↓
Prospectivity
 ↓
Turn on uncertainty
 ↓
Inspect high-uncertainty/high-prospectivity area
 ↓
Active Exploration
 ↓
Review candidate drill sites
 ↓
Open DR-017
 ↓
Review evidence + information gain
 ↓
Approve / reject / request review
 ↓
Production Intelligence
 ↓
Shortfall forecast
 ↓
Root Cause
 ↓
What-if
 ↓
Compare scenarios
 ↓
Create decision
 ↓
Generate report
```

This is the core demonstration flow.

------------------------------------------------------------------------

# 54. FINAL DEMO SCRIPT

1.  Open Dashboard and show mine, production forecast, shortfall risk,
    exploration status and uncertainty.
2.  Open Prospectivity Map and show mine boundary, prospectivity,
    boreholes and uncertainty.
3.  Select an area and show probability, grade, uncertainty and
    supporting evidence.
4.  Open Active Exploration and show candidate drill sites.
5.  Open a candidate and show why the model selected it, uncertainty and
    expected information gain.
6.  Submit it for human review and show the audit trail.
7.  Open Production Intelligence and show actual, target, forecast and
    shortfall probability.
8.  Open Root Cause and show model contributions.
9.  Open What-if and compare operational scenarios.
10. Generate the decision report.

The USP must be obvious:

> ANVESHA connects exploration uncertainty with operational intelligence
> and turns predictions into reviewable decisions.

------------------------------------------------------------------------

# 55. FINAL ACCEPTANCE CHECKLIST

## Product

- [ ] Dashboard
- [ ] Exploration map
- [ ] 3D orebody
- [ ] Boreholes
- [ ] Assays
- [ ] Uncertainty
- [ ] Active Exploration
- [ ] Production forecast
- [ ] Shortfall analysis
- [ ] What-if
- [ ] Decision Center
- [ ] Reports
- [ ] Audit logs

## AI/ML

- [ ] Models versioned
- [ ] Predictions stored
- [ ] Uncertainty visible
- [ ] Explanations available
- [ ] Active exploration implemented
- [ ] Scenario engine implemented
- [ ] Demo mode labelled

## GIS

- [ ] PostGIS
- [ ] Spatial queries
- [ ] Map layers
- [ ] Boreholes spatially displayed
- [ ] Prospectivity spatially displayed
- [ ] Uncertainty spatially displayed
- [ ] Drill candidates spatially displayed
- [ ] 3D view

## UX4G

- [ ] UX4G 3.0 integrated
- [ ] UX4G tokens used
- [ ] UX4G components used
- [ ] No competing design system
- [ ] WCAG 2.1 AA target
- [ ] Keyboard navigation
- [ ] Visible focus
- [ ] Accessibility controls
- [ ] Responsive reflow
- [ ] No colour-only status
- [ ] Accessible tables
- [ ] Accessible forms
- [ ] Accessible modals
- [ ] Accessible breadcrumbs
- [ ] Accessible navbar

## Engineering

- [ ] TypeScript
- [ ] API validation
- [ ] Database migrations
- [ ] Automated tests
- [ ] Error handling
- [ ] Logging
- [ ] Security checks
- [ ] Environment configuration
- [ ] Docker setup
- [ ] Documentation

------------------------------------------------------------------------

# 56. FINAL COMMAND TO GEMINI ANTIGRAVITY

Build the project **stage by stage**.

At the beginning of each stage:

1.  Explain what will be built.
2.  Inspect the existing repository.
3.  Reuse existing code.
4.  Implement the stage.
5.  Run tests.
6.  Run the application.
7.  Verify the UI.
8.  Fix errors.
9.  Update documentation.
10. Report what is complete.
11. Report what remains.

Never replace working functionality unnecessarily.

Never fabricate data.

Never silently invent scientific assumptions.

Never replace UX4G with a custom visual system.

When a UX decision is ambiguous, consult the official UX4G
documentation.

When a scientific decision is ambiguous, document the assumption.

When a model output is uncertain, expose that uncertainty.

When an AI recommendation affects a real operational decision, require
human review.

The final result should feel like a professional
Government-of-India-style geospatial decision-support platform while
remaining clearly branded as **ANVESHA**, rather than falsely presenting
itself as an official government application.

The central product principle is:

> **ANVESHA should not merely predict. It should show the evidence,
> quantify uncertainty, recommend the next information-gathering action,
> simulate operational alternatives, and keep the human decision-maker
> in control.**

------------------------------------------------------------------------

# 57. OFFICIAL UX4G REFERENCES

1.  UX4G Design System 3.0 — https://www.ux4g.gov.in/
2.  UX4G Developer Documentation — https://doc.ux4g.gov.in/
3.  Foundations — https://www.ux4g.gov.in/foundations
4.  Components — https://www.ux4g.gov.in/components
5.  Accessibility — https://www.ux4g.gov.in/foundations/accessibility
6.  UX Handbook — https://www.ux4g.gov.in/resources/ux-handbook
7.  Theme Craft — https://www.ux4g.gov.in/resources/theme-craft
8.  For Developers — https://www.ux4g.gov.in/get-started/for-developers
9.  Typography — https://doc.ux4g.gov.in/content/typography.php
10. Navbar — https://doc.ux4g.gov.in/components/navbar.php
11. Tables — https://www.ux4g.gov.in/components/table
12. Cards — https://www.ux4g.gov.in/components/card
13. Alerts — https://doc.ux4g.gov.in/components/alerts.php
14. Modal — https://doc.ux4g.gov.in/components/modal.php
15. Breadcrumb — https://doc.ux4g.gov.in/components/breadcrumb.php
16. Pagination — https://www.ux4g.gov.in/components/pagination

------------------------------------------------------------------------

# 58. SOURCE-OF-TRUTH RULE

If this document conflicts with current official UX4G documentation on a
UI/UX implementation detail, use the current official UX4G documentation
and update `docs/UX4G.md`.

If this document conflicts with the project architecture, preserve the
core product goals:

``` text
Uncertainty-aware exploration
+
Active next-drill recommendation
+
Production shortfall intelligence
+
What-if optimization
+
Human-in-the-loop decisions
```

If this document conflicts with scientific validity, choose scientific
validity over visual polish. If it conflicts with accessibility, choose
accessibility. If it conflicts with security, choose security.

The final platform must be:

**Useful → Explainable → Uncertainty-aware → Accessible → Auditable →
Decision-oriented.**
