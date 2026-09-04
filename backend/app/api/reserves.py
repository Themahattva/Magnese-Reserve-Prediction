"""
Reserves API — Reserve estimation data and mapping.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.api_schemas import ReserveResponse, ReserveSummary

router = APIRouter()


@router.get("/summary", response_model=list[ReserveSummary])
async def get_reserves_summary(db: AsyncSession = Depends(get_db)):
    """Get reserve summary per mine."""
    return [
        ReserveSummary(mine_id=1, mine_name="Dongri Buzurg", total_estimated_tonnage=28500000, avg_grade=40.2, avg_confidence=0.87, num_blocks=24),
        ReserveSummary(mine_id=2, mine_name="Balaghat", total_estimated_tonnage=35200000, avg_grade=38.5, avg_confidence=0.82, num_blocks=31),
        ReserveSummary(mine_id=3, mine_name="Chikla", total_estimated_tonnage=18700000, avg_grade=42.1, avg_confidence=0.91, num_blocks=16),
        ReserveSummary(mine_id=4, mine_name="Munsar", total_estimated_tonnage=12300000, avg_grade=36.8, avg_confidence=0.75, num_blocks=12),
        ReserveSummary(mine_id=5, mine_name="Kandri", total_estimated_tonnage=22100000, avg_grade=39.4, avg_confidence=0.84, num_blocks=20),
        ReserveSummary(mine_id=6, mine_name="Gumgaon", total_estimated_tonnage=15800000, avg_grade=37.2, avg_confidence=0.79, num_blocks=14),
        ReserveSummary(mine_id=7, mine_name="Parsioni", total_estimated_tonnage=9400000, avg_grade=41.5, avg_confidence=0.88, num_blocks=8),
        ReserveSummary(mine_id=8, mine_name="Sitapatore", total_estimated_tonnage=5200000, avg_grade=34.9, avg_confidence=0.71, num_blocks=6),
        ReserveSummary(mine_id=9, mine_name="Tirodi", total_estimated_tonnage=11600000, avg_grade=38.8, avg_confidence=0.83, num_blocks=10),
    ]


@router.get("/blocks")
async def get_reserve_blocks(
    mine_id: int = Query(None),
    min_confidence: float = Query(0.0),
    db: AsyncSession = Depends(get_db),
):
    """Get individual reserve blocks with estimated tonnage and grade."""
    import random
    random.seed(mine_id or 0)

    blocks = []
    mine_centers = {
        1: (21.548660, 79.682890), 2: (21.849722, 80.226667), 3: (21.543056, 79.753889),
        4: (21.401389, 79.280833), 5: (21.411667, 79.266111), 6: (21.400000, 78.983333),
        7: (21.40, 79.22), 8: (21.666667, 79.666667), 9: (21.683056, 79.733056),
    }

    target_mines = [mine_id] if mine_id else list(mine_centers.keys())

    for mid in target_mines:
        lat, lon = mine_centers.get(mid, (21.5, 79.5))
        num_blocks = random.randint(6, 15)
        for b in range(num_blocks):
            confidence = round(random.uniform(0.55, 0.98), 2)
            if confidence < min_confidence:
                continue
            # Generate polygon (small square around point)
            offset_lat = random.uniform(-0.02, 0.02)
            offset_lon = random.uniform(-0.02, 0.02)
            size = 0.005
            block_center_lat = lat + offset_lat
            block_center_lon = lon + offset_lon
            blocks.append({
                "id": mid * 100 + b,
                "mine_id": mid,
                "block_id": f"BLK-{mid:02d}-{b+1:03d}",
                "center_lat": block_center_lat,
                "center_lon": block_center_lon,
                "polygon": [
                    [block_center_lat - size, block_center_lon - size],
                    [block_center_lat - size, block_center_lon + size],
                    [block_center_lat + size, block_center_lon + size],
                    [block_center_lat + size, block_center_lon - size],
                ],
                "estimated_tonnage": round(random.uniform(200000, 5000000)),
                "mn_grade_percent": round(random.uniform(30, 48), 1),
                "confidence_score": confidence,
                "estimation_method": random.choice(["ml_model", "kriging", "manual"]),
            })

    return blocks


@router.get("/drill-logs")
async def get_drill_logs(mine_id: int = Query(None), db: AsyncSession = Depends(get_db)):
    """Get drill log data for visualization."""
    import random
    random.seed(42)

    mine_centers = {
        1: (21.548660, 79.682890), 2: (21.849722, 80.226667), 3: (21.543056, 79.753889),
        4: (21.401389, 79.280833), 5: (21.411667, 79.266111), 6: (21.400000, 78.983333),
        7: (21.40, 79.22), 8: (21.666667, 79.666667), 9: (21.683056, 79.733056),
    }

    target_mines = [mine_id] if mine_id else list(mine_centers.keys())
    logs = []

    for mid in target_mines:
        lat, lon = mine_centers.get(mid, (21.5, 79.5))
        num_logs = random.randint(8, 20)
        for i in range(num_logs):
            logs.append({
                "id": mid * 100 + i,
                "mine_id": mid,
                "borehole_id": f"BH-{mid:02d}-{i+1:03d}",
                "latitude": lat + random.uniform(-0.015, 0.015),
                "longitude": lon + random.uniform(-0.015, 0.015),
                "depth_m": round(random.uniform(15, 120), 1),
                "mn_grade_percent": round(random.uniform(20, 52), 1),
                "fe_grade_percent": round(random.uniform(5, 25), 1),
                "rock_type": random.choice(["laterite", "gondite", "manganiferous shale", "quartzite"]),
                "formation": random.choice(["Sausar", "Penganga", "Dharwar"]),
            })

    return logs
