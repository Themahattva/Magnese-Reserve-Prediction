"""
Audit & Governance API — Structured audit logs for decisions, approvals, and simulations.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

# Structured in-memory audit log store
AUDIT_LOGS = [
    {
        "id": 101,
        "timestamp": "2026-09-18 14:32:10 IST",
        "user": "dr_sharma_geologist",
        "action": "APPROVED_DRILL_SITE",
        "entity": "Candidate Site DR-017 (Dongri Buzurg)",
        "previous_state": "Pending Review",
        "new_state": "Approved for Permitting",
        "reason": "Geological contact verified with Sentinel-2 band ratio; expected 28.4% uncertainty reduction",
        "model_version": "active-exploration-voi-v1.4",
        "data_version": "MOIL-GEO-2026-Q2",
    },
    {
        "id": 102,
        "timestamp": "2026-09-17 11:15:45 IST",
        "user": "ops_manager_verma",
        "action": "APPROVED_CORRECTIVE_ACTION",
        "entity": "Action #1: Excavator Redeployment to Sitapatore",
        "previous_state": "Pending Review",
        "new_state": "Approved & Dispatched",
        "reason": "Inter-mine haulage approved to mitigate critical 8,500T predicted shortfall",
        "model_version": "shortfall-predictor-v2.1",
        "data_version": "MOIL-OPS-2026-AUG",
    },
    {
        "id": 103,
        "timestamp": "2026-09-15 09:40:22 IST",
        "user": "ml_engineer_patel",
        "action": "DEPLOYED_MODEL_VERSION",
        "entity": "Production Shortfall Predictor v2.1.0",
        "previous_state": "Candidate Validation",
        "new_state": "Production Active",
        "reason": "Retrained with August monsoon rain telemetry; MAE reduced from 285T to 248T",
        "model_version": "shortfall-predictor-v2.1",
        "data_version": "MOIL-OPS-WEATHER-2026-AUG",
    },
    {
        "id": 104,
        "timestamp": "2026-09-14 16:05:00 IST",
        "user": "ops_planner_singh",
        "action": "SIMULATED_WHAT_IF_SCENARIO",
        "entity": "Monsoon Blasting Delay Mitigation Scenario",
        "previous_state": "Baseline Plan",
        "new_state": "Pre-blast Buffer Scenario Simulated",
        "reason": "Tested impact of 4-hour blasting delay against 25mm rain forecast for Gumgaon",
        "model_version": "shortfall-predictor-v2.1",
        "data_version": "IMD-FORECAST-2026-09",
    },
]


class AuditEntryCreate(BaseModel):
    user: str
    action: str
    entity: str
    previous_state: str
    new_state: str
    reason: str
    model_version: str = "anvesha-v2.1"
    data_version: str = "moil-live-2026"


@router.get("/")
@router.get("/logs")
async def get_audit_logs():
    """Retrieve all structured audit records."""
    return {
        "count": len(AUDIT_LOGS),
        "logs": AUDIT_LOGS,
    }


@router.get("/stats")
async def get_audit_stats():
    """Summary statistics for audit actions."""
    approvals = sum(1 for a in AUDIT_LOGS if "APPROV" in a["action"])
    simulations = sum(1 for a in AUDIT_LOGS if "SIMULAT" in a["action"])
    deployments = sum(1 for a in AUDIT_LOGS if "DEPLOY" in a["action"])
    return {
        "total_records": len(AUDIT_LOGS),
        "approvals": approvals,
        "simulations": simulations,
        "deployments": deployments,
    }


@router.post("/")
async def create_audit_log(entry: AuditEntryCreate):
    """Add a new audit event."""
    new_id = len(AUDIT_LOGS) + 101
    record = {
        "id": new_id,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "user": entry.user,
        "action": entry.action,
        "entity": entry.entity,
        "previous_state": entry.previous_state,
        "new_state": entry.new_state,
        "reason": entry.reason,
        "model_version": entry.model_version,
        "data_version": entry.data_version,
    }
    AUDIT_LOGS.insert(0, record)
    return {"success": True, "log_id": new_id, "entry": record}
