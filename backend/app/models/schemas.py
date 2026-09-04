"""
SQLAlchemy ORM models for the MOIL Manganese Intelligence system.
Uses PostGIS geometry types for geospatial data.
"""

from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Text,
    ForeignKey, Enum, JSON, Boolean,
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base
import enum


class MineType(str, enum.Enum):
    OPENCAST = "opencast"
    UNDERGROUND = "underground"
    MIXED = "mixed"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EquipmentStatus(str, enum.Enum):
    ACTIVE = "active"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    BREAKDOWN = "breakdown"


class ActionPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# ──────────────────────────────────────────────
# Mine Site Master Data
# ──────────────────────────────────────────────

class Mine(Base):
    __tablename__ = "mines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location = Column(Geometry("POINT", srid=4326))
    district = Column(String(100))
    state = Column(String(100), default="Maharashtra")
    mine_type = Column(Enum(MineType), default=MineType.OPENCAST)
    area_hectares = Column(Float)
    elevation_m = Column(Float)
    year_established = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    drill_logs = relationship("DrillLog", back_populates="mine")
    geological_features = relationship("GeologicalFeature", back_populates="mine")
    reserves = relationship("Reserve", back_populates="mine")
    production_records = relationship("ProductionRecord", back_populates="mine")
    equipment = relationship("Equipment", back_populates="mine")
    weather_data = relationship("WeatherData", back_populates="mine")
    satellite_indices = relationship("SatelliteIndex", back_populates="mine")
    shortfall_predictions = relationship("ShortfallPrediction", back_populates="mine")


# ──────────────────────────────────────────────
# Geological / Drill Data
# ──────────────────────────────────────────────

class DrillLog(Base):
    __tablename__ = "drill_logs"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    borehole_id = Column(String(50))
    coordinates = Column(Geometry("POINT", srid=4326))
    depth_m = Column(Float, nullable=False)
    mn_grade_percent = Column(Float)
    fe_grade_percent = Column(Float)
    sio2_percent = Column(Float)
    rock_type = Column(String(100))
    formation = Column(String(100))
    drill_date = Column(Date)
    notes = Column(Text)

    mine = relationship("Mine", back_populates="drill_logs")


class GeologicalFeature(Base):
    __tablename__ = "geological_features"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    feature_type = Column(String(50))  # fault, fold, vein, contact, etc.
    geom = Column(Geometry("GEOMETRY", srid=4326))
    properties = Column(JSON)
    description = Column(Text)

    mine = relationship("Mine", back_populates="geological_features")


# ──────────────────────────────────────────────
# Reserve Estimation
# ──────────────────────────────────────────────

class Reserve(Base):
    __tablename__ = "reserves"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    block_id = Column(String(50))
    block_geom = Column(Geometry("POLYGON", srid=4326))
    estimated_tonnage = Column(Float)
    mn_grade_percent = Column(Float)
    confidence_score = Column(Float)  # 0.0 - 1.0
    estimation_method = Column(String(50))  # ml_model, manual, kriging
    model_version = Column(String(20))
    estimated_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="reserves")


# ──────────────────────────────────────────────
# Production Records
# ──────────────────────────────────────────────

class ProductionRecord(Base):
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    date = Column(Date, nullable=False)
    shift = Column(String(20))  # morning, afternoon, night
    planned_qty_tonnes = Column(Float)
    actual_qty_tonnes = Column(Float)
    ore_grade_percent = Column(Float)
    waste_tonnes = Column(Float)
    stripping_ratio = Column(Float)
    blasting_done = Column(Boolean, default=False)
    blasting_delay_hours = Column(Float, default=0)
    notes = Column(Text)

    mine = relationship("Mine", back_populates="production_records")


# ──────────────────────────────────────────────
# Equipment
# ──────────────────────────────────────────────

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    equipment_type = Column(String(50))  # excavator, dumper, drill, loader
    model_name = Column(String(100))
    capacity = Column(String(50))
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    last_maintenance = Column(Date)
    next_maintenance = Column(Date)

    mine = relationship("Mine", back_populates="equipment")
    logs = relationship("EquipmentLog", back_populates="equipment")


class EquipmentLog(Base):
    __tablename__ = "equipment_logs"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    date = Column(Date, nullable=False)
    hours_operated = Column(Float)
    downtime_hours = Column(Float)
    downtime_reason = Column(String(200))  # maintenance, breakdown, weather, no_operator
    fuel_consumed_liters = Column(Float)
    material_moved_tonnes = Column(Float)

    equipment = relationship("Equipment", back_populates="logs")


# ──────────────────────────────────────────────
# Weather & Satellite Data
# ──────────────────────────────────────────────

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    date = Column(Date, nullable=False)
    rainfall_mm = Column(Float)
    temperature_max_c = Column(Float)
    temperature_min_c = Column(Float)
    humidity_percent = Column(Float)
    soil_moisture = Column(Float)
    wind_speed_kmh = Column(Float)

    mine = relationship("Mine", back_populates="weather_data")


class SatelliteIndex(Base):
    __tablename__ = "satellite_indices"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    date = Column(Date, nullable=False)
    satellite_source = Column(String(50))  # sentinel-2, landsat-8, modis
    ndvi = Column(Float)       # Normalized Difference Vegetation Index
    ndmi = Column(Float)       # Normalized Difference Moisture Index
    lst = Column(Float)        # Land Surface Temperature (°C)
    iron_oxide_ratio = Column(Float)   # Band 4/Band 2
    clay_mineral_index = Column(Float) # Band 5/Band 7
    mn_probability = Column(Float)     # Derived Mn presence probability

    mine = relationship("Mine", back_populates="satellite_indices")


# ──────────────────────────────────────────────
# ML Predictions & Recommendations
# ──────────────────────────────────────────────

class ShortfallPrediction(Base):
    __tablename__ = "shortfall_predictions"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(Date, nullable=False)
    planned_qty_tonnes = Column(Float)
    predicted_qty_tonnes = Column(Float)
    shortfall_tonnes = Column(Float)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW)
    confidence_score = Column(Float)
    contributing_factors = Column(JSON)  # {factor: weight} dict
    model_version = Column(String(20))

    mine = relationship("Mine", back_populates="shortfall_predictions")
    corrective_actions = relationship("CorrectiveAction", back_populates="prediction")


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("shortfall_predictions.id"), nullable=False)
    action_type = Column(String(50))  # reschedule, redeploy, maintenance, blend, stockpile
    description = Column(Text, nullable=False)
    priority = Column(Enum(ActionPriority), default=ActionPriority.MEDIUM)
    estimated_impact_tonnes = Column(Float)
    estimated_impact_percent = Column(Float)
    implementation_steps = Column(JSON)
    is_implemented = Column(Boolean, default=False)
    implemented_at = Column(DateTime)

    prediction = relationship("ShortfallPrediction", back_populates="corrective_actions")
