"""
Recommendations API — Corrective actions and suggestions.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()


@router.get("/actions")
async def get_corrective_actions(
    mine_id: int = Query(None),
    priority: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get recommended corrective actions."""
    actions = [
        {
            "id": 1,
            "prediction_id": 1,
            "mine_id": 8,
            "mine_name": "Sitapatore",
            "action_type": "redeploy",
            "title": "Redeploy idle excavators from Parsioni to Sitapatore",
            "description": "2 excavators at Parsioni mine are currently idle. Redeploying them to Sitapatore can increase daily output by ~900 tonnes and reduce the predicted shortfall by 39%.",
            "priority": "urgent",
            "estimated_impact_tonnes": 6300,
            "estimated_impact_percent": 39.0,
            "implementation_steps": [
                "Coordinate with Parsioni mine supervisor for equipment release",
                "Arrange transport for 2 CAT 390F excavators",
                "Brief Sitapatore operators on face allocation",
                "Target deployment within 48 hours",
            ],
            "category": "Equipment",
            "is_implemented": False,
        },
        {
            "id": 2,
            "prediction_id": 1,
            "mine_id": 8,
            "mine_name": "Sitapatore",
            "action_type": "reschedule",
            "title": "Add night shift operations for 5 days",
            "description": "Introducing a night shift at Sitapatore for the next 5 days can compensate for lost daytime production and recover ~1,500 tonnes.",
            "priority": "high",
            "estimated_impact_tonnes": 1500,
            "estimated_impact_percent": 9.2,
            "implementation_steps": [
                "Allocate night shift workforce (min 12 operators)",
                "Ensure adequate lighting at active faces",
                "Pre-position dumpers and fuel for night operations",
                "Coordinate with blasting team for pre-shift preparation",
            ],
            "category": "Schedule",
            "is_implemented": False,
        },
        {
            "id": 3,
            "prediction_id": 2,
            "mine_id": 4,
            "mine_name": "Munsar",
            "action_type": "maintenance",
            "title": "Fast-track excavator hydraulic repair",
            "description": "Excavator EXC-412 has been under maintenance for hydraulic failure for 3 days. Expediting repair with additional technicians can restore 450 tonnes/day capacity.",
            "priority": "high",
            "estimated_impact_tonnes": 3150,
            "estimated_impact_percent": 22.0,
            "implementation_steps": [
                "Deploy 2 additional hydraulic technicians from Nagpur workshop",
                "Order priority spare parts (hydraulic pump assembly)",
                "Set up parallel repair track — fix seal + replace pump simultaneously",
                "Target repair completion within 36 hours",
            ],
            "category": "Equipment",
            "is_implemented": False,
        },
        {
            "id": 4,
            "prediction_id": 3,
            "mine_id": 6,
            "mine_name": "Gumgaon",
            "action_type": "reschedule",
            "title": "Pre-blast before predicted rainfall window",
            "description": "Weather forecast shows heavy rain from Sept 12-14. Completing blasting operations by Sept 11 will ensure material availability during the rain period.",
            "priority": "medium",
            "estimated_impact_tonnes": 1800,
            "estimated_impact_percent": 24.5,
            "implementation_steps": [
                "Advance blasting schedule by 2 days (target Sept 10-11)",
                "Prepare additional blast holes in Blocks G3 and G5",
                "Stockpile blasted material near crusher for rain-day processing",
                "Coordinate with explosive supplier for advance delivery",
            ],
            "category": "Weather",
            "is_implemented": False,
        },
        {
            "id": 5,
            "prediction_id": 4,
            "mine_id": 2,
            "mine_name": "Balaghat",
            "action_type": "blend",
            "title": "Optimize ore blending from Blocks B3 and B7",
            "description": "Grade variation in Block B7 (34% Mn) can be compensated by blending with high-grade ore from Block B3 (44% Mn) to maintain target grade of 38%.",
            "priority": "medium",
            "estimated_impact_tonnes": 630,
            "estimated_impact_percent": 18.0,
            "implementation_steps": [
                "Route 60% of dumpers to Block B3 (high grade face)",
                "Route 40% of dumpers to Block B7 (lower grade face)",
                "Set up blending at crusher feed point",
                "Monitor hourly grade samples to maintain 38% target",
            ],
            "category": "Quality",
            "is_implemented": False,
        },
        {
            "id": 6,
            "prediction_id": 1,
            "mine_id": 8,
            "mine_name": "Sitapatore",
            "action_type": "stockpile",
            "title": "Activate emergency stockpile buffer",
            "description": "Release 2,000 tonnes from Sitapatore's emergency stockpile to fulfill pending customer orders while production recovery is in progress.",
            "priority": "urgent",
            "estimated_impact_tonnes": 2000,
            "estimated_impact_percent": 12.3,
            "implementation_steps": [
                "Verify stockpile inventory and grade documentation",
                "Coordinate with dispatch team for customer allocation",
                "Begin stockpile reclamation with available loader",
                "Replenish stockpile once production normalizes",
            ],
            "category": "Logistics",
            "is_implemented": False,
        },
    ]

    if mine_id:
        actions = [a for a in actions if a["mine_id"] == mine_id]
    if priority:
        actions = [a for a in actions if a["priority"] == priority]

    return actions


@router.get("/history")
async def get_action_history(db: AsyncSession = Depends(get_db)):
    """Get history of past corrective actions and their outcomes."""
    return [
        {
            "id": 101,
            "mine_name": "Dongri Buzurg",
            "action": "Redeployed 1 excavator from Tirodi",
            "date_implemented": "2026-08-20",
            "predicted_impact_tonnes": 2800,
            "actual_impact_tonnes": 3100,
            "outcome": "success",
        },
        {
            "id": 102,
            "mine_name": "Balaghat",
            "action": "Pre-blast before monsoon onset",
            "date_implemented": "2026-07-02",
            "predicted_impact_tonnes": 4500,
            "actual_impact_tonnes": 4100,
            "outcome": "success",
        },
        {
            "id": 103,
            "mine_name": "Munsar",
            "action": "Added night shift for 7 days",
            "date_implemented": "2026-08-10",
            "predicted_impact_tonnes": 2100,
            "actual_impact_tonnes": 1200,
            "outcome": "partial",
        },
        {
            "id": 104,
            "mine_name": "Gumgaon",
            "action": "Ore blending optimization",
            "date_implemented": "2026-08-15",
            "predicted_impact_tonnes": 800,
            "actual_impact_tonnes": 750,
            "outcome": "success",
        },
    ]


@router.get("/categories")
async def get_action_categories(db: AsyncSession = Depends(get_db)):
    """Get action categories with counts."""
    return [
        {"category": "Equipment", "count": 2, "icon": "🔧"},
        {"category": "Schedule", "count": 1, "icon": "📅"},
        {"category": "Weather", "count": 1, "icon": "🌧️"},
        {"category": "Quality", "count": 1, "icon": "📊"},
        {"category": "Logistics", "count": 1, "icon": "🚚"},
    ]
