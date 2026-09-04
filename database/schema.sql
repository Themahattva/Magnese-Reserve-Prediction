-- ============================================
-- MOIL Manganese Intelligence — Database Schema
-- PostgreSQL 16 + PostGIS 3.4
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ──────────────────────────────────────────────
-- ENUM TYPES
-- ──────────────────────────────────────────────

CREATE TYPE mine_type AS ENUM ('opencast', 'underground', 'mixed');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE equipment_status AS ENUM ('active', 'idle', 'maintenance', 'breakdown');
CREATE TYPE action_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ──────────────────────────────────────────────
-- MINES — Master table for all mine sites
-- ──────────────────────────────────────────────

CREATE TABLE mines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location GEOMETRY(POINT, 4326),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Maharashtra',
    mine_type mine_type DEFAULT 'opencast',
    area_hectares FLOAT,
    elevation_m FLOAT,
    year_established INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mines_location ON mines USING GIST(location);

-- ──────────────────────────────────────────────
-- DRILL LOGS — Borehole/drill data per mine
-- ──────────────────────────────────────────────

CREATE TABLE drill_logs (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    borehole_id VARCHAR(50),
    coordinates GEOMETRY(POINT, 4326),
    depth_m FLOAT NOT NULL,
    mn_grade_percent FLOAT,
    fe_grade_percent FLOAT,
    sio2_percent FLOAT,
    rock_type VARCHAR(100),
    formation VARCHAR(100),
    drill_date DATE,
    notes TEXT
);

CREATE INDEX idx_drill_logs_mine ON drill_logs(mine_id);
CREATE INDEX idx_drill_logs_coords ON drill_logs USING GIST(coordinates);

-- ──────────────────────────────────────────────
-- GEOLOGICAL FEATURES
-- ──────────────────────────────────────────────

CREATE TABLE geological_features (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    feature_type VARCHAR(50),
    geom GEOMETRY(GEOMETRY, 4326),
    properties JSONB,
    description TEXT
);

CREATE INDEX idx_geo_features_mine ON geological_features(mine_id);
CREATE INDEX idx_geo_features_geom ON geological_features USING GIST(geom);

-- ──────────────────────────────────────────────
-- RESERVES — Estimated reserve blocks
-- ──────────────────────────────────────────────

CREATE TABLE reserves (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    block_id VARCHAR(50),
    block_geom GEOMETRY(POLYGON, 4326),
    estimated_tonnage FLOAT,
    mn_grade_percent FLOAT,
    confidence_score FLOAT,
    estimation_method VARCHAR(50),
    model_version VARCHAR(20),
    estimated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reserves_mine ON reserves(mine_id);
CREATE INDEX idx_reserves_geom ON reserves USING GIST(block_geom);

-- ──────────────────────────────────────────────
-- PRODUCTION RECORDS
-- ──────────────────────────────────────────────

CREATE TABLE production_records (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    date DATE NOT NULL,
    shift VARCHAR(20),
    planned_qty_tonnes FLOAT,
    actual_qty_tonnes FLOAT,
    ore_grade_percent FLOAT,
    waste_tonnes FLOAT,
    stripping_ratio FLOAT,
    blasting_done BOOLEAN DEFAULT FALSE,
    blasting_delay_hours FLOAT DEFAULT 0,
    notes TEXT
);

CREATE INDEX idx_production_mine_date ON production_records(mine_id, date);

-- ──────────────────────────────────────────────
-- EQUIPMENT
-- ──────────────────────────────────────────────

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    equipment_type VARCHAR(50),
    model_name VARCHAR(100),
    capacity VARCHAR(50),
    status equipment_status DEFAULT 'active',
    last_maintenance DATE,
    next_maintenance DATE
);

CREATE INDEX idx_equipment_mine ON equipment(mine_id);

CREATE TABLE equipment_logs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
    date DATE NOT NULL,
    hours_operated FLOAT,
    downtime_hours FLOAT,
    downtime_reason VARCHAR(200),
    fuel_consumed_liters FLOAT,
    material_moved_tonnes FLOAT
);

CREATE INDEX idx_eq_logs_equipment_date ON equipment_logs(equipment_id, date);

-- ──────────────────────────────────────────────
-- WEATHER DATA
-- ──────────────────────────────────────────────

CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    date DATE NOT NULL,
    rainfall_mm FLOAT,
    temperature_max_c FLOAT,
    temperature_min_c FLOAT,
    humidity_percent FLOAT,
    soil_moisture FLOAT,
    wind_speed_kmh FLOAT
);

CREATE INDEX idx_weather_mine_date ON weather_data(mine_id, date);

-- ──────────────────────────────────────────────
-- SATELLITE INDICES
-- ──────────────────────────────────────────────

CREATE TABLE satellite_indices (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    date DATE NOT NULL,
    satellite_source VARCHAR(50),
    ndvi FLOAT,
    ndmi FLOAT,
    lst FLOAT,
    iron_oxide_ratio FLOAT,
    clay_mineral_index FLOAT,
    mn_probability FLOAT
);

CREATE INDEX idx_satellite_mine_date ON satellite_indices(mine_id, date);

-- ──────────────────────────────────────────────
-- SHORTFALL PREDICTIONS
-- ──────────────────────────────────────────────

CREATE TABLE shortfall_predictions (
    id SERIAL PRIMARY KEY,
    mine_id INTEGER REFERENCES mines(id) NOT NULL,
    prediction_date TIMESTAMP DEFAULT NOW(),
    target_date DATE NOT NULL,
    planned_qty_tonnes FLOAT,
    predicted_qty_tonnes FLOAT,
    shortfall_tonnes FLOAT,
    risk_level risk_level DEFAULT 'low',
    confidence_score FLOAT,
    contributing_factors JSONB,
    model_version VARCHAR(20)
);

CREATE INDEX idx_predictions_mine ON shortfall_predictions(mine_id);
CREATE INDEX idx_predictions_target ON shortfall_predictions(target_date);

-- ──────────────────────────────────────────────
-- CORRECTIVE ACTIONS
-- ──────────────────────────────────────────────

CREATE TABLE corrective_actions (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER REFERENCES shortfall_predictions(id) NOT NULL,
    action_type VARCHAR(50),
    description TEXT NOT NULL,
    priority action_priority DEFAULT 'medium',
    estimated_impact_tonnes FLOAT,
    estimated_impact_percent FLOAT,
    implementation_steps JSONB,
    is_implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP
);

CREATE INDEX idx_actions_prediction ON corrective_actions(prediction_id);

-- ──────────────────────────────────────────────
-- SEED DATA — MOIL Mine Locations
-- ──────────────────────────────────────────────

INSERT INTO mines (name, location, district, state, mine_type, area_hectares, elevation_m, year_established) VALUES
('Dongri Buzurg', ST_SetSRID(ST_MakePoint(79.682890, 21.548660), 4326), 'Bhandara', 'Maharashtra', 'opencast', 285.0, 310, 1962),
('Balaghat', ST_SetSRID(ST_MakePoint(80.226667, 21.849722), 4326), 'Balaghat', 'Madhya Pradesh', 'underground', 420.0, 380, 1956),
('Chikla', ST_SetSRID(ST_MakePoint(79.753889, 21.543056), 4326), 'Nagpur', 'Maharashtra', 'opencast', 180.0, 290, 1970),
('Munsar', ST_SetSRID(ST_MakePoint(79.280833, 21.401389), 4326), 'Nagpur', 'Maharashtra', 'opencast', 210.0, 320, 1965),
('Kandri', ST_SetSRID(ST_MakePoint(79.266111, 21.411667), 4326), 'Nagpur', 'Maharashtra', 'underground', 310.0, 280, 1958),
('Gumgaon', ST_SetSRID(ST_MakePoint(78.983333, 21.400000), 4326), 'Nagpur', 'Maharashtra', 'opencast', 155.0, 305, 1972),
('Parsioni', ST_SetSRID(ST_MakePoint(79.22, 21.40), 4326), 'Nagpur', 'Maharashtra', 'opencast', 120.0, 275, 1978),
('Sitapatore', ST_SetSRID(ST_MakePoint(79.666667, 21.666667), 4326), 'Balaghat', 'Madhya Pradesh', 'underground', 190.0, 410, 1960),
('Tirodi', ST_SetSRID(ST_MakePoint(79.733056, 21.683056), 4326), 'Balaghat', 'Madhya Pradesh', 'mixed', 240.0, 350, 1968);
