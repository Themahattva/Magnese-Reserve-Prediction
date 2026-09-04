"""
Predictions API — Shortfall predictions and risk assessment.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.api_schemas import WhatIfRequest, WhatIfResponse

router = APIRouter()


@router.get("/shortfalls")
async def get_shortfall_predictions(
    mine_id: int = Query(None),
    risk_level: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get shortfall predictions for upcoming periods."""
    predictions = [
        {
            "id": 1, "mine_id": 8, "mine_name": "Sitapatore",
            "target_date": "2026-09-10", "planned_qty_tonnes": 4200,
            "predicted_qty_tonnes": 1890, "shortfall_tonnes": 2310,
            "risk_level": "critical", "confidence_score": 0.89,
            "contributing_factors": {
                "equipment_downtime": 0.42,
                "rainfall": 0.28,
                "grade_variation": 0.18,
                "blasting_delay": 0.12,
            },
        },
        {
            "id": 2, "mine_id": 4, "mine_name": "Munsar",
            "target_date": "2026-09-08", "planned_qty_tonnes": 3800,
            "predicted_qty_tonnes": 2356, "shortfall_tonnes": 1444,
            "risk_level": "high", "confidence_score": 0.84,
            "contributing_factors": {
                "equipment_downtime": 0.55,
                "seasonal_pattern": 0.22,
                "labor_shortage": 0.13,
                "blasting_delay": 0.10,
            },
        },
        {
            "id": 3, "mine_id": 6, "mine_name": "Gumgaon",
            "target_date": "2026-09-12", "planned_qty_tonnes": 3200,
            "predicted_qty_tonnes": 2464, "shortfall_tonnes": 736,
            "risk_level": "medium", "confidence_score": 0.76,
            "contributing_factors": {
                "rainfall": 0.48,
                "grade_variation": 0.25,
                "equipment_downtime": 0.15,
                "blasting_delay": 0.12,
            },
        },
        {
            "id": 4, "mine_id": 2, "mine_name": "Balaghat",
            "target_date": "2026-09-15", "planned_qty_tonnes": 3500,
            "predicted_qty_tonnes": 2870, "shortfall_tonnes": 630,
            "risk_level": "medium", "confidence_score": 0.72,
            "contributing_factors": {
                "grade_variation": 0.38,
                "seasonal_pattern": 0.30,
                "rainfall": 0.20,
                "equipment_downtime": 0.12,
            },
        },
        {
            "id": 5, "mine_id": 1, "mine_name": "Dongri Buzurg",
            "target_date": "2026-09-14", "planned_qty_tonnes": 4000,
            "predicted_qty_tonnes": 3680, "shortfall_tonnes": 320,
            "risk_level": "low", "confidence_score": 0.81,
            "contributing_factors": {
                "seasonal_pattern": 0.40,
                "rainfall": 0.35,
                "equipment_downtime": 0.15,
                "grade_variation": 0.10,
            },
        },
    ]

    if mine_id:
        predictions = [p for p in predictions if p["mine_id"] == mine_id]
    if risk_level:
        predictions = [p for p in predictions if p["risk_level"] == risk_level]

    return predictions


@router.get("/risk-calendar")
async def get_risk_calendar(mine_id: int = Query(None), db: AsyncSession = Depends(get_db)):
    """Get risk level calendar for upcoming 30 days."""
    import random
    from datetime import date, timedelta
    random.seed(42)

    calendar = []
    base_date = date(2026, 9, 1)

    for day_offset in range(30):
        current_date = base_date + timedelta(days=day_offset)
        risk_weights = [0.4, 0.3, 0.2, 0.1]  # low, medium, high, critical
        risk = random.choices(["low", "medium", "high", "critical"], weights=risk_weights)[0]

        # More risk on weekdays in monsoon
        if current_date.weekday() < 5 and random.random() > 0.6:
            risk = random.choice(["medium", "high"])

        calendar.append({
            "date": current_date.isoformat(),
            "risk_level": risk,
            "predicted_production_percent": round(random.uniform(45, 105), 1),
        })

    return calendar


@router.post("/what-if", response_model=WhatIfResponse)
async def run_what_if_simulation(request: WhatIfRequest, db: AsyncSession = Depends(get_db)):
    """Run a what-if simulation with adjusted parameters."""
    baseline = 3500.0 * request.days_ahead  # baseline daily production * days

    # Calculate impacts
    equipment_impact = request.equipment_down * 450 * request.days_ahead  # ~450 tonnes per equipment per day
    rainfall_impact = (request.rainfall_mm / 50) * 800 * request.days_ahead  # heavy rain reduces production
    blasting_impact = request.blasting_delay_hours * 200  # ~200 tonnes per hour of delay
    shift_bonus = baseline * 0.15 if request.extra_shift else 0  # extra shift adds ~15%

    total_impact = equipment_impact + rainfall_impact + blasting_impact - shift_bonus
    adjusted = max(0, baseline - total_impact)
    impact_percent = round(((baseline - adjusted) / baseline) * 100, 1) if baseline > 0 else 0

    if impact_percent > 40:
        risk = "critical"
    elif impact_percent > 25:
        risk = "high"
    elif impact_percent > 10:
        risk = "medium"
    else:
        risk = "low"

    return WhatIfResponse(
        baseline_production=round(baseline),
        adjusted_production=round(adjusted),
        impact_tonnes=round(baseline - adjusted),
        impact_percent=impact_percent,
        risk_level=risk,
        breakdown={
            "equipment_downtime_impact": round(equipment_impact),
            "rainfall_impact": round(rainfall_impact),
            "blasting_delay_impact": round(blasting_impact),
            "extra_shift_bonus": round(shift_bonus),
        },
    )


@router.get("/model-accuracy")
async def get_model_accuracy(db: AsyncSession = Depends(get_db)):
    """Get historical model accuracy metrics."""
    import random
    random.seed(42)

    points = []
    for i in range(50):
        actual = random.uniform(1500, 5000)
        error = random.gauss(0, 300)
        predicted = actual + error
        points.append({
            "actual": round(actual, 1),
            "predicted": round(predicted, 1),
            "date": f"2026-{random.randint(1,8):02d}-{random.randint(1,28):02d}",
        })

    return {
        "scatter_data": points,
        "metrics": {
            "rmse": 312.4,
            "mae": 248.7,
            "r2_score": 0.87,
            "accuracy_within_10_percent": 78.5,
        },
    }
