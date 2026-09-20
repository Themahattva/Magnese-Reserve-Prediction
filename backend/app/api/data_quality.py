"""
Data Quality & Sources Registry API — Data integrity, freshness, and sensor health.
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

DATA_SOURCES = [
    {
        "source_id": "SRC-SAT-01",
        "name": "Sentinel-2 MSI Multispectral Imagery",
        "type": "Satellite / Remote Sensing",
        "resolution": "10m / 20m spatial, 5-day revisit",
        "coverage": "All 9 MOIL Mining Leases + 15km Buffer",
        "last_acquisition": "2026-09-18",
        "last_processed": "2026-09-19 04:30 UTC",
        "quality_score_percent": 99.2,
        "status": "Healthy",
        "cloud_cover_percent": 3.4,
    },
    {
        "source_id": "SRC-HYP-02",
        "name": "PRISMA Hyperspectral Imagery (ASI)",
        "type": "Hyperspectral Remote Sensing",
        "resolution": "30m spatial, 239 spectral bands (VNIR/SWIR)",
        "coverage": "Dongri Buzurg, Chikla, Sitapatore Quadrants",
        "last_acquisition": "2026-08-28",
        "last_processed": "2026-08-30",
        "quality_score_percent": 96.5,
        "status": "Healthy",
        "cloud_cover_percent": 1.2,
    },
    {
        "source_id": "SRC-GEO-03",
        "name": "Geological Survey of India (GSI) 1:50K Maps",
        "type": "Geological Lithology & Formations",
        "resolution": "Vector Shapefiles / Sausar Group Stratigraphy",
        "coverage": "Nagpur, Bhandara, Balaghat Mining Belts",
        "last_acquisition": "2026-01-15",
        "last_processed": "2026-01-20",
        "quality_score_percent": 100.0,
        "status": "Verified",
        "cloud_cover_percent": 0.0,
    },
    {
        "source_id": "SRC-ASSAY-04",
        "name": "MOIL Chemical Assay Laboratory Telemetry",
        "type": "Core Drilling & Chemical Assays",
        "resolution": "0.5m - 2.0m sample intervals (Mn, Fe, SiO2, P)",
        "coverage": "142 Active & Historical Boreholes",
        "last_acquisition": "2026-09-15",
        "last_processed": "2026-09-16 11:00 UTC",
        "quality_score_percent": 98.8,
        "status": "Healthy",
        "cloud_cover_percent": 0.0,
    },
    {
        "source_id": "SRC-WTH-05",
        "name": "India Meteorological Department (IMD) AWS",
        "type": "Weather Telemetry",
        "resolution": "Hourly rainfall (mm), temp, humidity, soil moisture",
        "coverage": "Nagpur, Gondia, Balaghat Regional Stations",
        "last_acquisition": "2026-09-20 00:00 IST",
        "last_processed": "2026-09-20 00:15 IST",
        "quality_score_percent": 99.8,
        "status": "Live",
        "cloud_cover_percent": 0.0,
    },
    {
        "source_id": "SRC-IOT-06",
        "name": "Mining Fleet SCADA & Equipment IoT",
        "type": "Equipment Telemetry",
        "resolution": "Hourly operating hours, fuel consumption, downtime",
        "coverage": "96 Heavy Earthmoving Units across 9 Mines",
        "last_acquisition": "2026-09-19 23:30 IST",
        "last_processed": "2026-09-20 00:05 IST",
        "quality_score_percent": 97.4,
        "status": "Live",
        "cloud_cover_percent": 0.0,
    },
]


@router.get("/sources")
async def get_data_sources():
    """List all registered data sources feeding into ANVESHA."""
    return {
        "count": len(DATA_SOURCES),
        "last_audit": datetime.utcnow().isoformat(),
        "overall_health": "Optimal",
        "sources": DATA_SOURCES,
    }


@router.get("/quality-metrics")
@router.get("/metrics")
async def get_quality_metrics():
    """Aggregated data quality indicators across all datasets."""
    return {
        "completeness_score_percent": 98.4,
        "freshness_index": "Updated 14 mins ago",
        "schema_validity_percent": 99.6,
        "spatial_coverage_percent": 100.0,
        "outlier_rate_percent": 0.4,
        "missing_values_percent": 0.8,
        "total_records_analyzed": 148500,
        "data_quarantine_records": 12,
    }
