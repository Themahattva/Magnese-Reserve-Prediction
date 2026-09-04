# MOIL Manganese Intelligence — SIH26009

> AI/ML & Space Technology powered system for manganese reserve identification and production shortfall prediction for MOIL Ltd.

Built for **Smart India Hackathon 2026** | Problem Statement **SIH26009** | Ministry of Steel

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Leaflet.js, Recharts |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic |
| **Database** | PostgreSQL 16 + PostGIS 3.4 |
| **ML/AI** | scikit-learn, XGBoost, pandas, numpy |
| **Satellite** | Google Earth Engine, rasterio, geopandas |
| **DevOps** | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ & npm
- Python 3.11+

### 1. Clone & Setup

```bash
git clone <repo-url>
cd SIH
```

### 2. Start Database

```bash
docker compose up db -d
```

### 3. Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Open Dashboard

Navigate to [http://localhost:3000](http://localhost:3000)

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📊 Features

- **Reserve Mapping** — Interactive map with drill logs, reserve blocks, and satellite overlays
- **Production Analytics** — Real-time production vs target tracking with equipment monitoring
- **Shortfall Prediction** — ML-based risk assessment with contributing factor analysis
- **What-if Simulator** — Adjust parameters and see predicted production impact
- **Corrective Actions** — AI-recommended actions with implementation steps and impact scores

## 📁 Project Structure

```
SIH/
├── frontend/          # Next.js dashboard
├── backend/           # FastAPI server
├── ml/                # ML training & notebooks
├── database/          # Schema & migrations
└── docker-compose.yml
```

## 👥 Team

SIH 2026 Team

## 📜 License

MIT
