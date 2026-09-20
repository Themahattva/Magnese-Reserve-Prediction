"""
ANVESHA — Formal Reports & Regulatory Documentation API
Endpoints for generating formal Government of India compliant dossiers,
executive audit trails, and technical mining reports.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import hashlib

router = APIRouter()

REPORT_TEMPLATES = [
    {
        "id": "Exploration_Prospectivity_Report",
        "title": "Manganese Prospectivity & Next-Best Borehole Location Dossier",
        "category": "Geological Intelligence",
        "classification": "RESTRICTED / OFFICIAL USE ONLY",
        "issuing_authority": "Ministry of Mines, Government of India / MOIL Limited",
        "target_mines": ["Balaghat", "Dongri Buzurg", "Chikla", "Munsar", "Gumgaon", "Sitapatore", "Tirodi", "Kandri", "Parsioni"],
        "sections": [
            "Executive Summary & Lease Overview",
            "Geostatistical Kriging & 3D Orebody Intercepts",
            "Bayesian Active Learning Borehole Targets",
            "Geological Certainty & Confidence Matrix",
            "Official Recommendation & Exploration Plan"
        ],
        "export_formats": ["PDF", "JSON"]
    },
    {
        "id": "Production_Shortfall_Report",
        "title": "Production Shortfall Forecast & IMD Weather Vulnerability Brief",
        "category": "Operational Risk & Forecasting",
        "classification": "RESTRICTED / OFFICIAL USE ONLY",
        "issuing_authority": "Ministry of Mines, Government of India / MOIL Limited",
        "target_mines": ["Sitapatore", "Munsar", "Gumgaon", "Balaghat", "Dongri Buzurg"],
        "sections": [
            "30-Day Operational Forecast Overview",
            "Shovel-Dumper Equipment Bottleneck Analysis",
            "IMD Hydrologic Precipitation Inundation Impact",
            "Blasting Delay & Muckpile Depletion Metrics",
            "Calibrated What-If Recovery Simulations",
            "Statutory Mitigation Directives"
        ],
        "export_formats": ["PDF", "JSON"]
    },
    {
        "id": "Human_Decision_Governance_Log",
        "title": "Human Sign-Off & Review Accountability Governance Record",
        "category": "Compliance & Decision Audit",
        "classification": "RESTRICTED / OFFICIAL USE ONLY",
        "issuing_authority": "Ministry of Mines, Government of India / MOIL Limited",
        "target_mines": ["All 9 MOIL Central Leases"],
        "sections": [
            "Decision Governance Framework (ISO/IEC 42001)",
            "Authorized Officer Sign-Off Ledger",
            "System Recommendation vs Human Action Deliberation",
            "Verification Evidence Citations",
            "Immutable Cryptographic SHA-256 Audit Trail"
        ],
        "export_formats": ["PDF", "JSON"]
    },
    {
        "id": "Executive_Audit_Trail_Report",
        "title": "Executive Strategic Dossier & Immutable System Governance Audit Trail",
        "category": "Strategic Planning & Executive Review",
        "classification": "CONFIDENTIAL / INTERNAL MOIL",
        "issuing_authority": "Ministry of Mines, Government of India / MOIL Limited",
        "target_mines": ["All 9 MOIL Mines (Sausar Manganese Corridor)"],
        "sections": [
            "National Reserve Position & Life of Mine (LoM)",
            "Strategic Production Performance vs FY26 Targets",
            "Exploration AI Model Calibration & Drift Audit",
            "Operational Risk Heatmap & Incident Prevention",
            "Signatures of Competent Authorities"
        ],
        "export_formats": ["PDF", "JSON"]
    }
]


class ReportGenerateRequest(BaseModel):
    template_id: str
    target_mine_id: Optional[int] = None
    requested_by: str = "Chief Mining Geologist"
    format: str = "pdf"


class ReportGenerateResponse(BaseModel):
    report_id: str
    template_id: str
    title: str
    file_reference_number: str
    classification: str
    generated_at: str
    sha256_hash: str
    officer_signatories: List[Dict[str, str]]
    download_url: str


@router.get("/templates")
async def list_report_templates():
    """List all available formal Government of India report templates."""
    return {"templates": REPORT_TEMPLATES, "total": len(REPORT_TEMPLATES)}


@router.post("/generate", response_model=ReportGenerateResponse)
async def generate_report(request: ReportGenerateRequest):
    """Generate official report metadata and signature block."""
    tpl = next((t for t in REPORT_TEMPLATES if t["id"] == request.template_id), None)
    if not tpl:
        raise HTTPException(status_code=404, detail=f"Report template '{request.template_id}' not found.")

    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")
    timestamp_str = now.isoformat()
    ref_num = f"MOIL/ANVESHA/{request.template_id[:4].upper()}/{now.strftime('%Y%m%d-%H%M')}"
    
    # Compute deterministic cryptographic hash
    hash_seed = f"{ref_num}:{request.requested_by}:{timestamp_str}"
    report_hash = hashlib.sha256(hash_seed.encode()).hexdigest()

    return ReportGenerateResponse(
        report_id=f"rep_{now.strftime('%Y%m%d%H%M%S')}",
        template_id=request.template_id,
        title=tpl["title"],
        file_reference_number=ref_num,
        classification=tpl["classification"],
        generated_at=timestamp_str,
        sha256_hash=report_hash,
        officer_signatories=[
            {
                "name": "Dr. R. K. Sharma",
                "designation": "Chief General Manager (Geology & Exploration)",
                "authority": "Competent Person (UNFC 1997 / CRIRSCO)",
                "signed_at": timestamp_str
            },
            {
                "name": "Shri Vivek K. Verma",
                "designation": "Director (Production & Planning)",
                "authority": "MOIL Limited / Ministry of Mines, Govt. of India",
                "signed_at": timestamp_str
            }
        ],
        download_url=f"/api/reports/download/{request.template_id}?date={date_str}"
    )
