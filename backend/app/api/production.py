"""
Production API — Production records, analytics, and equipment data.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/records")
async def get_production_records(
    mine_id: int = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get production records with optional filters."""
    import random
    from datetime import date, timedelta
    random.seed(42)

    mine_names = {
        1: "Dongri Buzurg", 2: "Balaghat", 3: "Chikla", 4: "Munsar",
        5: "Kandri", 6: "Gumgaon", 7: "Parsioni", 8: "Sitapatore", 9: "Tirodi",
    }

    target_mines = [mine_id] if mine_id else list(mine_names.keys())
    records = []

    # Generate 90 days of production data
    base_date = date(2026, 6, 1)
    for day_offset in range(90):
        current_date = base_date + timedelta(days=day_offset)

        for mid in target_mines:
            daily_target = random.uniform(2500, 4500)

            # Monsoon effect (Jul-Sep)
            month = current_date.month
            if month in (7, 8, 9):
                efficiency = random.uniform(0.5, 0.85)
            elif month == 6:
                efficiency = random.uniform(0.7, 0.95)
            else:
                efficiency = random.uniform(0.8, 1.05)

            # Weekend reduced production
            if current_date.weekday() >= 5:
                efficiency *= 0.6

            actual = daily_target * efficiency
            grade = random.uniform(32, 46)

            records.append({
                "id": len(records) + 1,
                "mine_id": mid,
                "mine_name": mine_names[mid],
                "date": current_date.isoformat(),
                "planned_qty_tonnes": round(daily_target, 1),
                "actual_qty_tonnes": round(actual, 1),
                "ore_grade_percent": round(grade, 1),
                "waste_tonnes": round(actual * random.uniform(0.3, 0.8), 1),
                "blasting_done": random.random() > 0.3,
                "blasting_delay_hours": round(random.uniform(0, 4), 1) if random.random() > 0.7 else 0,
            })

    return records


@router.get("/summary")
async def get_production_summary(db: AsyncSession = Depends(get_db)):
    """Get aggregated production summary per mine."""
    return [
        {"mine_id": 1, "mine_name": "Dongri Buzurg", "total_planned": 315000, "total_actual": 289800, "shortfall_percent": 8.0, "avg_grade": 40.2},
        {"mine_id": 2, "mine_name": "Balaghat", "total_planned": 280000, "total_actual": 218400, "shortfall_percent": 22.0, "avg_grade": 38.5},
        {"mine_id": 3, "mine_name": "Chikla", "total_planned": 195000, "total_actual": 185250, "shortfall_percent": 5.0, "avg_grade": 42.1},
        {"mine_id": 4, "mine_name": "Munsar", "total_planned": 210000, "total_actual": 130200, "shortfall_percent": 38.0, "avg_grade": 36.8},
        {"mine_id": 5, "mine_name": "Kandri", "total_planned": 260000, "total_actual": 228800, "shortfall_percent": 12.0, "avg_grade": 39.4},
        {"mine_id": 6, "mine_name": "Gumgaon", "total_planned": 175000, "total_actual": 129500, "shortfall_percent": 26.0, "avg_grade": 37.2},
        {"mine_id": 7, "mine_name": "Parsioni", "total_planned": 140000, "total_actual": 126000, "shortfall_percent": 10.0, "avg_grade": 41.5},
        {"mine_id": 8, "mine_name": "Sitapatore", "total_planned": 120000, "total_actual": 54000, "shortfall_percent": 55.0, "avg_grade": 34.9},
        {"mine_id": 9, "mine_name": "Tirodi", "total_planned": 165000, "total_actual": 150150, "shortfall_percent": 9.0, "avg_grade": 38.8},
    ]


@router.get("/equipment")
async def get_equipment_status(mine_id: int = Query(None), db: AsyncSession = Depends(get_db)):
    """Get equipment status and utilization."""
    import random
    random.seed(42)

    equipment_types = ["Excavator", "Dumper", "Drill Rig", "Loader", "Bulldozer", "Crusher"]
    statuses = ["active", "active", "active", "idle", "maintenance", "breakdown"]

    mine_ids = [mine_id] if mine_id else list(range(1, 10))
    equipment_list = []

    for mid in mine_ids:
        num_equipment = random.randint(8, 15)
        for i in range(num_equipment):
            eq_type = random.choice(equipment_types)
            status = random.choice(statuses)
            equipment_list.append({
                "id": mid * 100 + i,
                "mine_id": mid,
                "equipment_type": eq_type,
                "model_name": f"{eq_type[:3].upper()}-{random.randint(100,999)}",
                "status": status,
                "utilization_percent": round(random.uniform(20, 95), 1) if status == "active" else 0,
                "hours_today": round(random.uniform(0, 8), 1) if status in ("active", "idle") else 0,
                "downtime_reason": random.choice(["scheduled maintenance", "hydraulic failure", "tire replacement", "engine overhaul"]) if status in ("maintenance", "breakdown") else None,
            })

    return equipment_list
