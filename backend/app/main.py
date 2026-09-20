"""
ANVESHA — Uncertainty-Aware AI for Manganese Exploration & Production
FastAPI Backend Application
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api import (
    dashboard,
    reserves,
    production,
    predictions,
    recommendations,
    satellite,
    exploration,
    models_registry,
    data_quality,
    audit,
    reports,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    print("🚀 Starting ANVESHA Decision Support System v3.0")
    print(f"📊 Mode: Simulation / Deterministic Demo Engine (Debug: {settings.DEBUG})")
    yield
    print("👋 Shutting down ANVESHA...")


app = FastAPI(
    title="ANVESHA — Manganese Exploration & Production Intelligence",
    version="3.0.0",
    description=(
        "Uncertainty-Aware AI/ML and Space Technology Decision Support Platform "
        "for Manganese Prospectivity, 3D Orebody Modeling, Active Exploration, "
        "and Production Shortfall Prediction for MOIL Ltd."
    ),
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(exploration.router, prefix="/api/exploration", tags=["Exploration"])
app.include_router(reserves.router, prefix="/api/reserves", tags=["Reserves"])
app.include_router(production.router, prefix="/api/production", tags=["Production"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Decision Center / Recommendations"])
app.include_router(satellite.router, prefix="/api/satellite", tags=["Satellite"])
app.include_router(models_registry.router, prefix="/api/models", tags=["Model Registry"])
app.include_router(data_quality.router, prefix="/api/data-quality", tags=["Data Quality"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Log"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
async def root():
    """Root endpoint returning system metadata."""
    return {
        "name": "ANVESHA API Platform",
        "version": "3.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "ANVESHA",
        "version": "3.0.0",
        "mode": "Simulation Mode (Verified Synthetic Datasets)",
        "compliance": "UX4G 3.0 / WCAG 2.1 AA",
    }
