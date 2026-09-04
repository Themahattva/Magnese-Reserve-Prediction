"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class MineTypeEnum(str, Enum):
    OPENCAST = "opencast"
    UNDERGROUND = "underground"
    MIXED = "mixed"


class RiskLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EquipmentStatusEnum(str, Enum):
    ACTIVE = "active"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    BREAKDOWN = "breakdown"


# ──────────────────────────────────────────────
# Mine Schemas
# ──────────────────────────────────────────────

class MineBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    district: str
    state: str = "Maharashtra"
    mine_type: MineTypeEnum = MineTypeEnum.OPENCAST
    area_hectares: Optional[float] = None
    elevation_m: Optional[float] = None
    year_established: Optional[int] = None
    is_active: bool = True


class MineResponse(MineBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Production Schemas
# ──────────────────────────────────────────────

class ProductionRecordBase(BaseModel):
    mine_id: int
    date: date
    shift: Optional[str] = None
    planned_qty_tonnes: float
    actual_qty_tonnes: float
    ore_grade_percent: Optional[float] = None
    waste_tonnes: Optional[float] = None
    blasting_done: bool = False
    blasting_delay_hours: float = 0


class ProductionRecordResponse(ProductionRecordBase):
    id: int

    class Config:
        from_attributes = True


class ProductionSummary(BaseModel):
    mine_id: int
    mine_name: str
    total_planned: float
    total_actual: float
    shortfall: float
    shortfall_percent: float
    avg_grade: float
    days_with_shortfall: int
    total_days: int


# ──────────────────────────────────────────────
# Reserve Schemas
# ──────────────────────────────────────────────

class ReserveResponse(BaseModel):
    id: int
    mine_id: int
    block_id: str
    estimated_tonnage: float
    mn_grade_percent: float
    confidence_score: float
    estimation_method: str
    estimated_at: datetime

    class Config:
        from_attributes = True


class ReserveSummary(BaseModel):
    mine_id: int
    mine_name: str
    total_estimated_tonnage: float
    avg_grade: float
    avg_confidence: float
    num_blocks: int


# ──────────────────────────────────────────────
# Prediction Schemas
# ──────────────────────────────────────────────

class ShortfallPredictionResponse(BaseModel):
    id: int
    mine_id: int
    prediction_date: datetime
    target_date: date
    planned_qty_tonnes: float
    predicted_qty_tonnes: float
    shortfall_tonnes: float
    risk_level: RiskLevelEnum
    confidence_score: float
    contributing_factors: Optional[dict] = None

    class Config:
        from_attributes = True


class CorrectiveActionResponse(BaseModel):
    id: int
    prediction_id: int
    action_type: str
    description: str
    priority: str
    estimated_impact_tonnes: Optional[float] = None
    estimated_impact_percent: Optional[float] = None
    implementation_steps: Optional[list] = None
    is_implemented: bool = False

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Dashboard Schemas
# ──────────────────────────────────────────────

class DashboardKPIs(BaseModel):
    total_reserves_mt: float = Field(description="Total estimated reserves in million tonnes")
    current_production_rate: float = Field(description="Current month production in tonnes")
    production_target: float = Field(description="Current month target in tonnes")
    active_alerts: int = Field(description="Number of active shortfall alerts")
    equipment_utilization: float = Field(description="Equipment utilization percentage")
    avg_ore_grade: float = Field(description="Average ore grade across active mines")
    mines_count: int = Field(description="Total number of active mines")
    risk_mines_count: int = Field(description="Number of mines with high/critical risk")


class MineStatusSummary(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    risk_level: RiskLevelEnum
    production_percent: float
    estimated_reserves: float


# ──────────────────────────────────────────────
# Satellite Schemas
# ──────────────────────────────────────────────

class SatelliteIndexResponse(BaseModel):
    id: int
    mine_id: int
    date: date
    satellite_source: str
    ndvi: Optional[float] = None
    ndmi: Optional[float] = None
    lst: Optional[float] = None
    iron_oxide_ratio: Optional[float] = None
    clay_mineral_index: Optional[float] = None
    mn_probability: Optional[float] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# What-If Simulator
# ──────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    mine_id: int
    days_ahead: int = 7
    equipment_down: int = 0
    rainfall_mm: float = 0
    blasting_delay_hours: float = 0
    extra_shift: bool = False


class WhatIfResponse(BaseModel):
    baseline_production: float
    adjusted_production: float
    impact_tonnes: float
    impact_percent: float
    risk_level: RiskLevelEnum
    breakdown: dict
