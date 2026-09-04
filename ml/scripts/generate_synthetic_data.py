"""
Generate realistic synthetic datasets for the MOIL Manganese Intelligence system.

This script creates CSV files simulating:
- Mine master data (based on real MOIL mine locations)
- Drill log records
- Production records (with monsoon seasonal effects)
- Equipment fleet and daily logs
- Weather data
- Satellite-derived indices
- Shortfall predictions and corrective actions

Usage:
    python ml/scripts/generate_synthetic_data.py
"""

import os
import csv
import random
import math
from datetime import date, timedelta, datetime

random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─── Real MOIL Mine Locations ──────────────────────
MINES = [
    {"id": 1, "name": "Dongri Buzurg", "lat": 21.548660, "lon": 79.682890, "district": "Bhandara", "state": "Maharashtra", "type": "opencast", "area": 285, "elevation": 310, "year": 1962},
    {"id": 2, "name": "Balaghat", "lat": 21.849722, "lon": 80.226667, "district": "Balaghat", "state": "Madhya Pradesh", "type": "underground", "area": 420, "elevation": 380, "year": 1956},
    {"id": 3, "name": "Chikla", "lat": 21.543056, "lon": 79.753889, "district": "Nagpur", "state": "Maharashtra", "type": "opencast", "area": 180, "elevation": 290, "year": 1970},
    {"id": 4, "name": "Munsar", "lat": 21.401389, "lon": 79.280833, "district": "Nagpur", "state": "Maharashtra", "type": "opencast", "area": 210, "elevation": 320, "year": 1965},
    {"id": 5, "name": "Kandri", "lat": 21.411667, "lon": 79.266111, "district": "Nagpur", "state": "Maharashtra", "type": "underground", "area": 310, "elevation": 280, "year": 1958},
    {"id": 6, "name": "Gumgaon", "lat": 21.400000, "lon": 78.983333, "district": "Nagpur", "state": "Maharashtra", "type": "opencast", "area": 155, "elevation": 305, "year": 1972},
    {"id": 7, "name": "Parsioni", "lat": 21.40, "lon": 79.22, "district": "Nagpur", "state": "Maharashtra", "type": "opencast", "area": 120, "elevation": 275, "year": 1978},
    {"id": 8, "name": "Sitapatore", "lat": 21.666667, "lon": 79.666667, "district": "Balaghat", "state": "Madhya Pradesh", "type": "underground", "area": 190, "elevation": 410, "year": 1960},
    {"id": 9, "name": "Tirodi", "lat": 21.683056, "lon": 79.733056, "district": "Balaghat", "state": "Madhya Pradesh", "type": "mixed", "area": 240, "elevation": 350, "year": 1968},
]

ROCK_TYPES = ["laterite", "gondite", "manganiferous shale", "quartzite", "phyllite"]
FORMATIONS = ["Sausar", "Penganga", "Dharwar", "Chilpi Ghat"]
EQUIPMENT_TYPES = ["Excavator", "Dumper", "Drill Rig", "Loader", "Bulldozer", "Crusher"]
DOWNTIME_REASONS = ["scheduled maintenance", "hydraulic failure", "tire replacement",
                     "engine overhaul", "electrical fault", "no operator", "weather halt"]


def write_csv(filename, rows, headers):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  ✓ {filename}: {len(rows)} records")


# ─── 1. Mines ──────────────────────────────────────
def generate_mines():
    rows = []
    for m in MINES:
        rows.append({
            "id": m["id"], "name": m["name"],
            "latitude": m["lat"], "longitude": m["lon"],
            "district": m["district"], "state": m["state"],
            "mine_type": m["type"], "area_hectares": m["area"],
            "elevation_m": m["elevation"], "year_established": m["year"],
            "is_active": True,
        })
    write_csv("mines.csv", rows, rows[0].keys())
    return rows


# ─── 2. Drill Logs ────────────────────────────────
def generate_drill_logs():
    rows = []
    log_id = 1
    for mine in MINES:
        num_logs = random.randint(15, 40)
        for i in range(num_logs):
            depth = random.uniform(10, 150)
            # Grade correlates with depth (higher grade at 30-80m)
            grade_factor = 1.0 - abs(depth - 55) / 100
            mn_grade = max(15, min(52, 35 * grade_factor + random.gauss(0, 5)))
            fe_grade = max(3, 25 - mn_grade * 0.3 + random.gauss(0, 3))

            rows.append({
                "id": log_id,
                "mine_id": mine["id"],
                "borehole_id": f"BH-{mine['id']:02d}-{i+1:03d}",
                "latitude": mine["lat"] + random.uniform(-0.015, 0.015),
                "longitude": mine["lon"] + random.uniform(-0.015, 0.015),
                "depth_m": round(depth, 1),
                "mn_grade_percent": round(mn_grade, 1),
                "fe_grade_percent": round(fe_grade, 1),
                "sio2_percent": round(random.uniform(3, 18), 1),
                "rock_type": random.choice(ROCK_TYPES),
                "formation": random.choice(FORMATIONS),
                "drill_date": (date(2020, 1, 1) + timedelta(days=random.randint(0, 2000))).isoformat(),
            })
            log_id += 1
    write_csv("drill_logs.csv", rows, rows[0].keys())
    return rows


# ─── 3. Production Records ────────────────────────
def generate_production_records():
    rows = []
    rec_id = 1
    start_date = date(2024, 1, 1)
    end_date = date(2026, 8, 31)

    for mine in MINES:
        # Base daily capacity varies by mine size
        base_capacity = mine["area"] * random.uniform(10, 18)

        current = start_date
        while current <= end_date:
            month = current.month
            day_of_week = current.weekday()

            # Seasonal efficiency
            if month in (7, 8):
                seasonal_eff = random.uniform(0.4, 0.7)  # Heavy monsoon
            elif month in (6, 9):
                seasonal_eff = random.uniform(0.6, 0.85)  # Monsoon shoulder
            elif month in (12, 1, 2):
                seasonal_eff = random.uniform(0.85, 1.05)  # Peak winter season
            else:
                seasonal_eff = random.uniform(0.75, 0.98)

            # Weekend reduction
            if day_of_week >= 5:
                seasonal_eff *= 0.5

            # Holidays (random 15 days/year)
            if random.random() < 0.04:
                seasonal_eff *= 0.1

            planned = base_capacity * random.uniform(0.9, 1.1)
            actual = planned * seasonal_eff

            # Random blasting
            blasting = random.random() > 0.35
            blast_delay = round(random.uniform(0, 6), 1) if (blasting and random.random() > 0.6) else 0
            if blast_delay > 2:
                actual *= 0.85

            grade = random.gauss(38, 4)
            grade = max(28, min(50, grade))

            for shift in ["morning", "afternoon"]:
                shift_factor = 0.6 if shift == "morning" else 0.4
                rows.append({
                    "id": rec_id,
                    "mine_id": mine["id"],
                    "date": current.isoformat(),
                    "shift": shift,
                    "planned_qty_tonnes": round(planned * shift_factor, 1),
                    "actual_qty_tonnes": round(actual * shift_factor, 1),
                    "ore_grade_percent": round(grade + random.gauss(0, 1.5), 1),
                    "waste_tonnes": round(actual * shift_factor * random.uniform(0.3, 0.9), 1),
                    "stripping_ratio": round(random.uniform(1.5, 6.0), 2),
                    "blasting_done": blasting,
                    "blasting_delay_hours": blast_delay if shift == "morning" else 0,
                })
                rec_id += 1
            current += timedelta(days=1)

    write_csv("production_records.csv", rows, rows[0].keys())
    return rows


# ─── 4. Equipment ─────────────────────────────────
def generate_equipment():
    equipment_rows = []
    log_rows = []
    eq_id = 1
    log_id = 1

    for mine in MINES:
        num_equipment = random.randint(8, 18)
        for i in range(num_equipment):
            eq_type = random.choice(EQUIPMENT_TYPES)
            status = random.choices(
                ["active", "active", "active", "idle", "maintenance", "breakdown"],
                weights=[3, 3, 3, 1, 1, 0.5]
            )[0]

            equipment_rows.append({
                "id": eq_id,
                "mine_id": mine["id"],
                "equipment_type": eq_type,
                "model_name": f"{eq_type[:3].upper()}-{random.randint(100, 999)}",
                "capacity": f"{random.randint(10, 100)}T",
                "status": status,
                "last_maintenance": (date(2026, 8, 1) - timedelta(days=random.randint(5, 90))).isoformat(),
                "next_maintenance": (date(2026, 9, 1) + timedelta(days=random.randint(5, 60))).isoformat(),
            })

            # Generate 90 days of logs
            for day_offset in range(90):
                log_date = date(2026, 6, 1) + timedelta(days=day_offset)
                if status == "breakdown" and day_offset > 80:
                    hours = 0
                    downtime = 8
                    reason = random.choice(DOWNTIME_REASONS[:4])
                elif random.random() > 0.85:
                    hours = 0
                    downtime = random.uniform(2, 8)
                    reason = random.choice(DOWNTIME_REASONS)
                else:
                    hours = random.uniform(4, 8)
                    downtime = max(0, 8 - hours)
                    reason = "" if downtime < 1 else random.choice(DOWNTIME_REASONS)

                log_rows.append({
                    "id": log_id,
                    "equipment_id": eq_id,
                    "date": log_date.isoformat(),
                    "hours_operated": round(hours, 1),
                    "downtime_hours": round(downtime, 1),
                    "downtime_reason": reason,
                    "fuel_consumed_liters": round(hours * random.uniform(15, 45), 1),
                    "material_moved_tonnes": round(hours * random.uniform(30, 80), 1),
                })
                log_id += 1
            eq_id += 1

    write_csv("equipment.csv", equipment_rows, equipment_rows[0].keys())
    write_csv("equipment_logs.csv", log_rows, log_rows[0].keys())
    return equipment_rows


# ─── 5. Weather Data ──────────────────────────────
def generate_weather():
    rows = []
    rec_id = 1
    start_date = date(2024, 1, 1)
    end_date = date(2026, 8, 31)

    for mine in MINES:
        current = start_date
        while current <= end_date:
            month = current.month

            # Rainfall patterns (central India monsoon)
            if month in (7, 8):
                rainfall = random.expovariate(0.05) + random.uniform(5, 30)
            elif month in (6, 9):
                rainfall = random.expovariate(0.1) + random.uniform(0, 15)
            elif month in (10, 11):
                rainfall = random.expovariate(0.5)
            else:
                rainfall = max(0, random.gauss(1, 3))

            # Temperature patterns
            if month in (4, 5):
                temp_max = random.uniform(38, 46)
                temp_min = random.uniform(24, 30)
            elif month in (12, 1):
                temp_max = random.uniform(24, 30)
                temp_min = random.uniform(8, 16)
            else:
                temp_max = random.uniform(28, 38)
                temp_min = random.uniform(18, 26)

            rows.append({
                "id": rec_id,
                "mine_id": mine["id"],
                "date": current.isoformat(),
                "rainfall_mm": round(max(0, rainfall), 1),
                "temperature_max_c": round(temp_max, 1),
                "temperature_min_c": round(temp_min, 1),
                "humidity_percent": round(min(100, max(20, 40 + rainfall * 1.5 + random.gauss(0, 10))), 1),
                "soil_moisture": round(min(1, max(0, 0.15 + rainfall * 0.005 + random.gauss(0, 0.05))), 3),
                "wind_speed_kmh": round(max(0, random.gauss(12, 6)), 1),
            })
            rec_id += 1
            current += timedelta(days=1)

    write_csv("weather_data.csv", rows, rows[0].keys())
    return rows


# ─── 6. Satellite Indices ─────────────────────────
def generate_satellite_indices():
    rows = []
    rec_id = 1
    start_date = date(2024, 1, 1)

    for mine in MINES:
        # Monthly observations for 30 months
        for month_offset in range(30):
            obs_date = start_date + timedelta(days=month_offset * 30)
            month = obs_date.month

            # Seasonal NDVI (higher in monsoon)
            if month in (7, 8, 9):
                ndvi = random.uniform(0.4, 0.75)
                ndmi = random.uniform(0.3, 0.6)
            elif month in (3, 4, 5):
                ndvi = random.uniform(0.08, 0.3)
                ndmi = random.uniform(0.05, 0.2)
            else:
                ndvi = random.uniform(0.2, 0.45)
                ndmi = random.uniform(0.15, 0.35)

            # LST inversely related to vegetation
            lst = 45 - ndvi * 30 + random.gauss(0, 3)

            # Iron oxide and clay indices — higher near mines
            iron_oxide = random.gauss(2.0, 0.5) if mine["type"] == "opencast" else random.gauss(1.5, 0.4)
            clay_index = random.gauss(1.5, 0.3)

            # Mn probability combines indices
            mn_prob = min(1.0, max(0, 0.3 + iron_oxide * 0.15 - ndvi * 0.3 + clay_index * 0.1 + random.gauss(0, 0.08)))

            rows.append({
                "id": rec_id,
                "mine_id": mine["id"],
                "date": obs_date.isoformat(),
                "satellite_source": random.choice(["sentinel-2", "landsat-8"]),
                "ndvi": round(ndvi, 4),
                "ndmi": round(ndmi, 4),
                "lst": round(lst, 1),
                "iron_oxide_ratio": round(max(0.5, iron_oxide), 3),
                "clay_mineral_index": round(max(0.3, clay_index), 3),
                "mn_probability": round(mn_prob, 3),
            })
            rec_id += 1

    write_csv("satellite_indices.csv", rows, rows[0].keys())
    return rows


# ─── Main ─────────────────────────────────────────
if __name__ == "__main__":
    print("🏭 Generating MOIL Synthetic Datasets")
    print("=" * 50)

    print("\n📍 Mines...")
    generate_mines()

    print("\n🔩 Drill Logs...")
    generate_drill_logs()

    print("\n📊 Production Records...")
    generate_production_records()

    print("\n🔧 Equipment & Logs...")
    generate_equipment()

    print("\n🌧️  Weather Data...")
    generate_weather()

    print("\n🛰️  Satellite Indices...")
    generate_satellite_indices()

    print(f"\n✅ All datasets generated in: {os.path.abspath(OUTPUT_DIR)}")
    print("=" * 50)
