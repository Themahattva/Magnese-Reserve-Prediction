"""
Satellite API — Satellite-derived indices and GEE data.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/indices")
async def get_satellite_indices(
    mine_id: int = Query(None),
    index_type: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get satellite-derived indices for mine sites."""
    import random
    from datetime import date, timedelta
    random.seed(42)

    mine_names = {
        1: "Dongri Buzurg", 2: "Balaghat", 3: "Chikla", 4: "Munsar",
        5: "Kandri", 6: "Gumgaon", 7: "Parsioni", 8: "Sitapatore", 9: "Tirodi",
    }

    target_mines = [mine_id] if mine_id else list(mine_names.keys())
    records = []
    base_date = date(2024, 1, 1)

    for mid in target_mines:
        # Generate monthly satellite data for 2 years
        for month_offset in range(24):
            current_date = base_date + timedelta(days=month_offset * 30)
            month = current_date.month

            # Seasonal NDVI pattern (higher in monsoon)
            if month in (7, 8, 9):
                ndvi = random.uniform(0.4, 0.7)
                ndmi = random.uniform(0.3, 0.6)
            elif month in (3, 4, 5):
                ndvi = random.uniform(0.1, 0.3)
                ndmi = random.uniform(0.05, 0.2)
            else:
                ndvi = random.uniform(0.2, 0.45)
                ndmi = random.uniform(0.15, 0.35)

            records.append({
                "id": mid * 1000 + month_offset,
                "mine_id": mid,
                "mine_name": mine_names[mid],
                "date": current_date.isoformat(),
                "satellite_source": "sentinel-2",
                "ndvi": round(ndvi, 3),
                "ndmi": round(ndmi, 3),
                "lst": round(random.uniform(25, 48) if month in (3, 4, 5) else random.uniform(18, 35), 1),
                "iron_oxide_ratio": round(random.uniform(1.2, 2.8), 2),
                "clay_mineral_index": round(random.uniform(0.8, 2.2), 2),
                "mn_probability": round(random.uniform(0.3, 0.95), 2),
            })

    return records


@router.get("/heatmap")
async def get_satellite_heatmap(
    mine_id: int = Query(...),
    index_type: str = Query("iron_oxide_ratio"),
    db: AsyncSession = Depends(get_db),
):
    """Get heatmap data for a specific satellite index around a mine site."""
    import random
    random.seed(mine_id)

    mine_centers = {
        1: (21.548660, 79.682890), 2: (21.849722, 80.226667), 3: (21.543056, 79.753889),
        4: (21.401389, 79.280833), 5: (21.411667, 79.266111), 6: (21.400000, 78.983333),
        7: (21.40, 79.22), 8: (21.666667, 79.666667), 9: (21.683056, 79.733056),
    }

    lat, lon = mine_centers.get(mine_id, (21.5, 79.5))
    points = []

    # Generate a 20x20 grid of points around the mine center
    grid_size = 20
    spacing = 0.002  # ~200m spacing

    for i in range(grid_size):
        for j in range(grid_size):
            point_lat = lat - (grid_size / 2) * spacing + i * spacing
            point_lon = lon - (grid_size / 2) * spacing + j * spacing

            # Create realistic spatial patterns with hot spots
            dist_from_center = ((point_lat - lat) ** 2 + (point_lon - lon) ** 2) ** 0.5

            if index_type == "iron_oxide_ratio":
                # Higher near mine center with some noise
                value = max(0.5, 3.0 - dist_from_center * 80 + random.gauss(0, 0.3))
            elif index_type == "clay_mineral_index":
                value = max(0.3, 2.5 - dist_from_center * 60 + random.gauss(0, 0.25))
            elif index_type == "mn_probability":
                value = min(1.0, max(0.0, 0.9 - dist_from_center * 30 + random.gauss(0, 0.15)))
            elif index_type == "ndvi":
                value = max(0.0, min(1.0, 0.2 + dist_from_center * 15 + random.gauss(0, 0.1)))
            elif index_type == "lst":
                value = 38 - dist_from_center * 100 + random.gauss(0, 2)
            else:
                value = random.uniform(0, 1)

            points.append({
                "lat": round(point_lat, 6),
                "lon": round(point_lon, 6),
                "value": round(value, 3),
            })

    return {
        "mine_id": mine_id,
        "index_type": index_type,
        "points": points,
        "min_value": min(p["value"] for p in points),
        "max_value": max(p["value"] for p in points),
        "center": {"lat": lat, "lon": lon},
    }


@router.get("/mines-locations")
async def get_mine_locations(db: AsyncSession = Depends(get_db)):
    """Get all mine locations for map display."""
    return [
        {"id": 1, "name": "Dongri Buzurg", "lat": 21.548660, "lon": 79.682890, "district": "Bhandara", "state": "Maharashtra", "type": "opencast"},
        {"id": 2, "name": "Balaghat", "lat": 21.849722, "lon": 80.226667, "district": "Balaghat", "state": "Madhya Pradesh", "type": "underground"},
        {"id": 3, "name": "Chikla", "lat": 21.543056, "lon": 79.753889, "district": "Nagpur", "state": "Maharashtra", "type": "opencast"},
        {"id": 4, "name": "Munsar", "lat": 21.401389, "lon": 79.280833, "district": "Nagpur", "state": "Maharashtra", "type": "opencast"},
        {"id": 5, "name": "Kandri", "lat": 21.411667, "lon": 79.266111, "district": "Nagpur", "state": "Maharashtra", "type": "underground"},
        {"id": 6, "name": "Gumgaon", "lat": 21.400000, "lon": 78.983333, "district": "Nagpur", "state": "Maharashtra", "type": "opencast"},
        {"id": 7, "name": "Parsioni", "lat": 21.40, "lon": 79.22, "district": "Nagpur", "state": "Maharashtra", "type": "opencast"},
        {"id": 8, "name": "Sitapatore", "lat": 21.666667, "lon": 79.666667, "district": "Balaghat", "state": "Madhya Pradesh", "type": "underground"},
        {"id": 9, "name": "Tirodi", "lat": 21.683056, "lon": 79.733056, "district": "Balaghat", "state": "Madhya Pradesh", "type": "mixed"},
    ]
