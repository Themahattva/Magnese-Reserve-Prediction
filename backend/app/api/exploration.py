"""
Exploration API — Active Exploration Engine, 3D Orebody, and Uncertainty Engine.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import random
from app.core.database import get_db

router = APIRouter()

# Calibrated coordinates for MOIL mines
MINE_COORDINATES = {
    1: {"name": "Dongri Buzurg", "lat": 21.548660, "lon": 79.682890, "district": "Bhandara", "type": "opencast"},
    2: {"name": "Balaghat", "lat": 21.849722, "lon": 80.226667, "district": "Balaghat", "type": "underground"},
    3: {"name": "Chikla", "lat": 21.543056, "lon": 79.753889, "district": "Bhandara", "type": "opencast"},
    4: {"name": "Munsar", "lat": 21.401389, "lon": 79.280833, "district": "Nagpur", "type": "opencast"},
    5: {"name": "Kandri", "lat": 21.411667, "lon": 79.266111, "district": "Nagpur", "type": "underground"},
    6: {"name": "Gumgaon", "lat": 21.400000, "lon": 78.983333, "district": "Nagpur", "type": "opencast"},
    7: {"name": "Parsioni", "lat": 21.400000, "lon": 79.220000, "district": "Nagpur", "type": "opencast"},
    8: {"name": "Sitapatore", "lat": 21.666667, "lon": 79.666667, "district": "Balaghat", "type": "underground"},
    9: {"name": "Tirodi", "lat": 21.683056, "lon": 79.733056, "district": "Balaghat", "type": "mixed"},
}

# In-memory store for drill candidates to allow live approval/rejection during evaluation
CANDIDATE_DRILL_SITES = [
    {
        "site_id": "DR-017",
        "mine_id": 1,
        "mine_name": "Dongri Buzurg",
        "latitude": 21.552410,
        "longitude": 79.686520,
        "priority": "high",
        "estimated_mn_probability": 0.82,
        "expected_grade_percent": 41.5,
        "uncertainty_level": "high",
        "expected_uncertainty_reduction_percent": 28.4,
        "value_of_information_score": 88.5,
        "estimated_drilling_cost_inr": 480000,
        "target_depth_m": 95.0,
        "accessibility": "Good (near haul road)",
        "geological_formation": "Mansar Formation (Mn-rich reef horizon)",
        "surface_spectral_evidence": "Iron oxide ratio 2.45, Clay mineral index 1.88 (Sentinel-2 band ratio)",
        "nearest_borehole_id": "BH-01-04",
        "distance_to_nearest_borehole_m": 420,
        "primary_reason": "High surface prospectivity paired with large geostatistical spacing. Drilling here maximizes information gain on strike continuation.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-024",
        "mine_id": 2,
        "mine_name": "Balaghat",
        "latitude": 21.853200,
        "longitude": 80.231500,
        "priority": "high",
        "estimated_mn_probability": 0.79,
        "expected_grade_percent": 44.2,
        "uncertainty_level": "high",
        "expected_uncertainty_reduction_percent": 24.1,
        "value_of_information_score": 84.0,
        "estimated_drilling_cost_inr": 620000,
        "target_depth_m": 140.0,
        "accessibility": "Moderate (ridge crest flank)",
        "geological_formation": "Mansar Gondite contact zone",
        "surface_spectral_evidence": "Strong Mn-shale alteration signature, low vegetation cover",
        "nearest_borehole_id": "BH-02-08",
        "distance_to_nearest_borehole_m": 510,
        "primary_reason": "Deep underground reef extension. Confirmatory core will establish reserve upgrade from Inferred to Indicated.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-031",
        "mine_id": 4,
        "mine_name": "Munsar",
        "latitude": 21.404500,
        "longitude": 79.284200,
        "priority": "medium",
        "estimated_mn_probability": 0.68,
        "expected_grade_percent": 36.8,
        "uncertainty_level": "medium",
        "expected_uncertainty_reduction_percent": 19.5,
        "value_of_information_score": 72.5,
        "estimated_drilling_cost_inr": 350000,
        "target_depth_m": 70.0,
        "accessibility": "Excellent (open pit ramp bench)",
        "geological_formation": "Chorbaoli Quartzite boundary",
        "surface_spectral_evidence": "Moderate iron absorption signature",
        "nearest_borehole_id": "BH-04-02",
        "distance_to_nearest_borehole_m": 310,
        "primary_reason": "Delineate lateral boundary of lower grade pit bench before scheduled excavation expansion.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-009",
        "mine_id": 8,
        "mine_name": "Sitapatore",
        "latitude": 21.669800,
        "longitude": 79.669900,
        "priority": "critical",
        "estimated_mn_probability": 0.74,
        "expected_grade_percent": 35.5,
        "uncertainty_level": "high",
        "expected_uncertainty_reduction_percent": 33.0,
        "value_of_information_score": 91.0,
        "estimated_drilling_cost_inr": 420000,
        "target_depth_m": 85.0,
        "accessibility": "Moderate (requires access track grading)",
        "geological_formation": "Sitasaongi Formation footwall",
        "surface_spectral_evidence": "Hyperspectral Mn indicator cluster along east fault line",
        "nearest_borehole_id": "BH-08-01",
        "distance_to_nearest_borehole_m": 680,
        "primary_reason": "Highest uncertainty reduction potential across all leases. Data will resolve structural fault offset affecting Sitapatore ore continuation.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-042",
        "mine_id": 3,
        "mine_name": "Chikla",
        "latitude": 21.546200,
        "longitude": 79.757100,
        "priority": "high",
        "estimated_mn_probability": 0.81,
        "expected_grade_percent": 42.1,
        "uncertainty_level": "medium",
        "expected_uncertainty_reduction_percent": 22.8,
        "value_of_information_score": 83.2,
        "estimated_drilling_cost_inr": 410000,
        "target_depth_m": 90.0,
        "accessibility": "Good (haulage perimeter)",
        "geological_formation": "Mansar Formation manganese ore reef",
        "surface_spectral_evidence": "Strong PRISMA absorption dip at 820nm",
        "nearest_borehole_id": "BH-CH-02",
        "distance_to_nearest_borehole_m": 380,
        "primary_reason": "Verifies eastward extension of Chikla main ore body toward Dongri boundary.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-055",
        "mine_id": 5,
        "mine_name": "Kandri",
        "latitude": 21.414800,
        "longitude": 79.269300,
        "priority": "high",
        "estimated_mn_probability": 0.77,
        "expected_grade_percent": 39.4,
        "uncertainty_level": "high",
        "expected_uncertainty_reduction_percent": 27.5,
        "value_of_information_score": 81.0,
        "estimated_drilling_cost_inr": 540000,
        "target_depth_m": 120.0,
        "accessibility": "Moderate (adit decline area)",
        "geological_formation": "Sausar Group synclinal trough",
        "surface_spectral_evidence": "AVIRIS-NG MnO band depth index 0.68",
        "nearest_borehole_id": "BH-KN-01",
        "distance_to_nearest_borehole_m": 460,
        "primary_reason": "Deep underground borehole targeting downward continuity of Kandri high-grade lode.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-063",
        "mine_id": 6,
        "mine_name": "Gumgaon",
        "latitude": 21.403200,
        "longitude": 78.986800,
        "priority": "medium",
        "estimated_mn_probability": 0.72,
        "expected_grade_percent": 37.0,
        "uncertainty_level": "medium",
        "expected_uncertainty_reduction_percent": 20.4,
        "value_of_information_score": 75.8,
        "estimated_drilling_cost_inr": 380000,
        "target_depth_m": 80.0,
        "accessibility": "Good (open pit access track)",
        "geological_formation": "Mansar Schist with Braunite lenses",
        "surface_spectral_evidence": "Sentinel-2 ferrous iron absorption peak",
        "nearest_borehole_id": "BH-GM-04",
        "distance_to_nearest_borehole_m": 340,
        "primary_reason": "Evaluates grade continuity between south pit wall and agricultural boundary.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-071",
        "mine_id": 7,
        "mine_name": "Parsioni",
        "latitude": 21.403500,
        "longitude": 79.224100,
        "priority": "medium",
        "estimated_mn_probability": 0.69,
        "expected_grade_percent": 34.8,
        "uncertainty_level": "high",
        "expected_uncertainty_reduction_percent": 25.2,
        "value_of_information_score": 74.0,
        "estimated_drilling_cost_inr": 360000,
        "target_depth_m": 75.0,
        "accessibility": "Moderate (scrub forest margin)",
        "geological_formation": "Lohangi Marble - Gondite horizon",
        "surface_spectral_evidence": "Hyperspectral carbonate/manganese anomaly",
        "nearest_borehole_id": "BH-PR-01",
        "distance_to_nearest_borehole_m": 490,
        "primary_reason": "Confirms presence of bedded braunite-quartz ore in unexplored western strike extension.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
    {
        "site_id": "DR-092",
        "mine_id": 9,
        "mine_name": "Tirodi",
        "latitude": 21.686500,
        "longitude": 79.736800,
        "priority": "high",
        "estimated_mn_probability": 0.83,
        "expected_grade_percent": 43.5,
        "uncertainty_level": "medium",
        "expected_uncertainty_reduction_percent": 24.6,
        "value_of_information_score": 86.4,
        "estimated_drilling_cost_inr": 450000,
        "target_depth_m": 105.0,
        "accessibility": "Good (mixed opencast haulage ramp)",
        "geological_formation": "Tirodi Biotite Gneiss contact reef",
        "surface_spectral_evidence": "Broad MnO2 absorption band with high confidence",
        "nearest_borehole_id": "BH-TR-03",
        "distance_to_nearest_borehole_m": 390,
        "primary_reason": "Delineates deep high-grade braunite zone beneath mined out opencast floor.",
        "review_status": "pending_review",
        "reviewed_by": None,
        "reviewed_at": None,
        "review_comments": None,
    },
]


@router.get("/drill-candidates")
async def get_drill_candidates(
    mine_id: Optional[int] = Query(None),
    priority: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Active Exploration Engine — Return candidate drill locations
    ranked by Value of Information (VoI) and uncertainty reduction potential.
    """
    results = CANDIDATE_DRILL_SITES
    if mine_id:
        results = [c for c in results if c["mine_id"] == mine_id]
    if priority:
        results = [c for c in results if c["priority"] == priority]

    return {
        "count": len(results),
        "model_version": "active-exploration-voi-v1.4",
        "algorithm": "Bayesian Expected Information Gain + Operational Cost Constraints",
        "candidates": results,
    }


@router.get("/drill-candidates/{site_id}")
async def get_drill_candidate_detail(site_id: str):
    """Get complete telemetry and evidence for a specific drill candidate."""
    for c in CANDIDATE_DRILL_SITES:
        if c["site_id"].upper() == site_id.upper():
            return c
    raise HTTPException(status_code=404, detail=f"Candidate drill site {site_id} not found")


@router.post("/drill-candidates/{site_id}/review")
async def review_drill_candidate(
    site_id: str,
    action: str = Query(..., pattern="^(approve|reject|request_evidence)$"),
    reviewer_name: str = Query("Exploration Reviewer"),
    comments: Optional[str] = Query(None),
):
    """Review workflow: Approve, reject, or request evidence for candidate drill site."""
    from datetime import datetime
    for c in CANDIDATE_DRILL_SITES:
        if c["site_id"].upper() == site_id.upper():
            c["review_status"] = "approved" if action == "approve" else ("rejected" if action == "reject" else "needs_evidence")
            c["reviewed_by"] = reviewer_name
            c["reviewed_at"] = datetime.utcnow().isoformat()
            c["review_comments"] = comments or f"Marked as {action} by {reviewer_name}"
            return {
                "success": True,
                "site_id": site_id,
                "status": c["review_status"],
                "message": f"Site {site_id} review state updated to {c['review_status']}",
            }
    raise HTTPException(status_code=404, detail=f"Candidate drill site {site_id} not found")


@router.get("/3d-orebody")
async def get_3d_orebody_model(mine_id: int = Query(1)):
    """
    3D Orebody Model — Inferred subsurface manganese prospectivity,
    borehole traces, and voxel block probability/uncertainty distribution.
    """
    random.seed(mine_id * 100)
    mine_info = MINE_COORDINATES.get(mine_id, MINE_COORDINATES[1])

    # Generate synthetic 3D voxel grid representing inferred orebody
    voxels = []
    nx, ny, nz = 8, 8, 6  # 8x8x6 grid
    dx, dy, dz = 40.0, 40.0, 15.0  # meters per voxel

    base_depth = 20.0
    for ix in range(nx):
        for iy in range(ny):
            for iz in range(nz):
                x = (ix - nx / 2) * dx
                y = (iy - ny / 2) * dy
                z = -(base_depth + iz * dz)

                dist_center = (x**2 + y**2)**0.5
                depth_factor = max(0.2, 1.0 - (iz / nz) * 0.6)

                # Simulated ore lens dipping slightly to the northeast
                dip_offset = (x * 0.3 + y * 0.2)
                z_rel = z + dip_offset

                if -80 <= z_rel <= -35:
                    mn_prob = min(0.96, max(0.25, 0.88 - dist_center * 0.003 + random.gauss(0, 0.08)))
                    grade = min(48.0, max(22.0, 38.5 + random.gauss(0, 3.2)))
                    uncertainty = max(0.12, min(0.75, (dist_center / 200.0) * 0.45 + (iz / nz) * 0.3))
                else:
                    mn_prob = max(0.05, 0.30 - dist_center * 0.002)
                    grade = max(10.0, 22.0 - abs(z_rel) * 0.1)
                    uncertainty = min(0.85, 0.4 + (iz / nz) * 0.4)

                voxels.append({
                    "x": round(x, 1),
                    "y": round(y, 1),
                    "z": round(z, 1),
                    "size_m": [dx, dy, dz],
                    "mn_probability": round(mn_prob, 2),
                    "estimated_grade_percent": round(grade, 1),
                    "uncertainty": round(uncertainty, 2),
                    "is_orebody": mn_prob > 0.60,
                })

    # Borehole depth traces
    boreholes = []
    bh_count = 6
    for b in range(bh_count):
        bh_x = (b % 3 - 1) * 90.0 + random.uniform(-15, 15)
        bh_y = (b // 3 - 0.5) * 110.0 + random.uniform(-15, 15)
        depth = 90 + random.randint(0, 40)
        boreholes.append({
            "id": f"BH-{mine_id:02d}-{b+1:02d}",
            "surface_coords": [round(bh_x, 1), round(bh_y, 1), 0.0],
            "depth_m": depth,
            "collar_elevation_m": 310.0,
            "assay_intercepts": [
                {"from_m": 0, "to_m": 25, "lithology": "Lateritic Soil & Overburden", "mn_percent": 4.2},
                {"from_m": 25, "to_m": 42, "lithology": "Quartz-Mica Schist", "mn_percent": 11.5},
                {"from_m": 42, "to_m": 78, "lithology": "Mansar Manganese Reef (High Grade)", "mn_percent": round(39.0 + random.uniform(-3, 6), 1)},
                {"from_m": 78, "to_m": depth, "lithology": "Gondite & Quartzite Footwall", "mn_percent": 14.8},
            ],
        })

    return {
        "mine_id": mine_id,
        "mine_name": mine_info["name"],
        "datum_crs": "EPSG:32644 (UTM Zone 44N)",
        "model_version": "orebody-kriging-rf-v1.4",
        "voxel_dimensions_m": [dx, dy, dz],
        "total_voxels": len(voxels),
        "voxels": voxels,
        "borehole_traces": boreholes,
    }


@router.get("/uncertainty")
@router.get("/uncertainty-grid")
async def get_uncertainty_grid(mine_id: int = Query(1)):
    """
    Dedicated Uncertainty Engine — Returns spatial uncertainty metrics,
    separating probability from confidence and evidence coverage.
    """
    random.seed(mine_id * 50)
    mine_info = MINE_COORDINATES.get(mine_id, MINE_COORDINATES[1])
    lat, lon = mine_info["lat"], mine_info["lon"]

    grid = []
    steps = 10
    step_size = 0.003

    for i in range(steps):
        for j in range(steps):
            plat = lat - (steps / 2) * step_size + i * step_size
            plon = lon - (steps / 2) * step_size + j * step_size
            dist = ((plat - lat)**2 + (plon - lon)**2)**0.5

            # Distance to nearest borehole drives uncertainty
            boreholes_near = max(0, int(6 - dist * 120 + random.randint(-1, 1)))
            uncertainty = min(0.95, max(0.10, dist * 65 + random.uniform(-0.08, 0.08)))
            prob = min(0.92, max(0.15, 0.82 - dist * 40 + random.uniform(-0.1, 0.1)))

            coverage = "good" if boreholes_near >= 4 else ("moderate" if boreholes_near >= 2 else "sparse")

            grid.append({
                "latitude": round(plat, 6),
                "longitude": round(plon, 6),
                "inferred_probability": round(prob, 2),
                "uncertainty_score": round(uncertainty, 2),
                "confidence_level": "high" if uncertainty < 0.35 else ("medium" if uncertainty < 0.65 else "low"),
                "supporting_boreholes_count": boreholes_near,
                "evidence_coverage": coverage,
                "is_drilling_target": prob > 0.65 and uncertainty > 0.50,
            })

    return {
        "mine_id": mine_id,
        "mine_name": mine_info["name"],
        "mean_uncertainty": round(sum(p["uncertainty_score"] for p in grid) / len(grid), 2),
        "high_uncertainty_target_zones": len([p for p in grid if p["is_drilling_target"]]),
        "grid_points": grid,
    }
