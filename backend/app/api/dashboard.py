"""
Dashboard API — Aggregated KPIs and mine status overview.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.api_schemas import DashboardKPIs, MineStatusSummary

router = APIRouter()


@router.get("/kpis", response_model=DashboardKPIs)
async def get_dashboard_kpis(db: AsyncSession = Depends(get_db)):
    """Get aggregated KPIs for the main dashboard."""
    # TODO: Replace with real DB queries once data is seeded
    return DashboardKPIs(
        total_reserves_mt=152.4,
        current_production_rate=98500,
        production_target=110000,
        active_alerts=4,
        equipment_utilization=78.5,
        avg_ore_grade=38.2,
        mines_count=9,
        risk_mines_count=2,
    )


@router.get("/mine-status", response_model=list[MineStatusSummary])
async def get_mine_status_summary(db: AsyncSession = Depends(get_db)):
    """Get status summary for all mines (for map markers)."""
    # TODO: Replace with real DB queries
    mock_mines = [
        MineStatusSummary(
            id=1, name="Dongri Buzurg", latitude=21.548660, longitude=79.682890,
            risk_level="low", production_percent=92.0, estimated_reserves=28.5,
        ),
        MineStatusSummary(
            id=2, name="Balaghat", latitude=21.849722, longitude=80.226667,
            risk_level="medium", production_percent=78.0, estimated_reserves=35.2,
        ),
        MineStatusSummary(
            id=3, name="Chikla", latitude=21.543056, longitude=79.753889,
            risk_level="low", production_percent=95.0, estimated_reserves=18.7,
        ),
        MineStatusSummary(
            id=4, name="Munsar", latitude=21.401389, longitude=79.280833,
            risk_level="high", production_percent=62.0, estimated_reserves=12.3,
        ),
        MineStatusSummary(
            id=5, name="Kandri", latitude=21.411667, longitude=79.266111,
            risk_level="low", production_percent=88.0, estimated_reserves=22.1,
        ),
        MineStatusSummary(
            id=6, name="Gumgaon", latitude=21.400000, longitude=78.983333,
            risk_level="medium", production_percent=74.0, estimated_reserves=15.8,
        ),
        MineStatusSummary(
            id=7, name="Parsioni", latitude=21.40, longitude=79.22,
            risk_level="low", production_percent=90.0, estimated_reserves=9.4,
        ),
        MineStatusSummary(
            id=8, name="Sitapatore", latitude=21.666667, longitude=79.666667,
            risk_level="critical", production_percent=45.0, estimated_reserves=5.2,
        ),
        MineStatusSummary(
            id=9, name="Tirodi", latitude=21.683056, longitude=79.733056,
            risk_level="low", production_percent=91.0, estimated_reserves=11.6,
        ),
    ]
    return mock_mines


@router.get("/production-trend")
async def get_production_trend(months: int = 12, db: AsyncSession = Depends(get_db)):
    """Get monthly production vs target trend."""
    import random
    random.seed(42)

    months_data = []
    month_names = [
        "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026",
        "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026",
    ]

    for i, month in enumerate(month_names[:months]):
        target = 100000 + random.randint(-5000, 5000)
        # Monsoon months (Jun-Sep) have lower actual production
        if i >= 8:  # Jun onwards
            actual = target * random.uniform(0.65, 0.85)
        else:
            actual = target * random.uniform(0.82, 1.02)

        months_data.append({
            "month": month,
            "target": round(target),
            "actual": round(actual),
            "shortfall": round(max(0, target - actual)),
        })

    return months_data


@router.get("/recent-alerts")
async def get_recent_alerts(limit: int = 5, db: AsyncSession = Depends(get_db)):
    """Get most recent shortfall alerts."""
    return [
        {
            "id": 1,
            "mine_name": "Sitapatore",
            "risk_level": "critical",
            "message": "Production shortfall of 8,500 tonnes predicted for next week",
            "target_date": "2026-09-10",
            "created_at": "2026-09-02T14:30:00",
        },
        {
            "id": 2,
            "mine_name": "Munsar",
            "risk_level": "high",
            "message": "Equipment downtime exceeding 40% — 2 excavators under maintenance",
            "target_date": "2026-09-08",
            "created_at": "2026-09-02T11:15:00",
        },
        {
            "id": 3,
            "mine_name": "Gumgaon",
            "risk_level": "medium",
            "message": "Heavy rainfall forecast may impact blasting schedule",
            "target_date": "2026-09-12",
            "created_at": "2026-09-01T09:45:00",
        },
        {
            "id": 4,
            "mine_name": "Balaghat",
            "risk_level": "medium",
            "message": "Grade variation detected in Block B7 — blend adjustment recommended",
            "target_date": "2026-09-15",
            "created_at": "2026-09-01T08:00:00",
        },
    ]
