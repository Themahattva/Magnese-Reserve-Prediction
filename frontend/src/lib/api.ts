const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper for the MOIL API.
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Dashboard API ──────────────────────────────
export const dashboardAPI = {
  getKPIs: () => apiFetch<DashboardKPIs>('/api/dashboard/kpis'),
  getMineStatus: () => apiFetch<MineStatus[]>('/api/dashboard/mine-status'),
  getProductionTrend: (months?: number) =>
    apiFetch<ProductionTrendPoint[]>(`/api/dashboard/production-trend?months=${months || 12}`),
  getRecentAlerts: (limit?: number) =>
    apiFetch<Alert[]>(`/api/dashboard/recent-alerts?limit=${limit || 5}`),
};

// ── Reserves API ───────────────────────────────
export const reservesAPI = {
  getSummary: () => apiFetch<ReserveSummary[]>('/api/reserves/summary'),
  getBlocks: (mineId?: number, minConfidence?: number) => {
    const params = new URLSearchParams();
    if (mineId) params.set('mine_id', String(mineId));
    if (minConfidence) params.set('min_confidence', String(minConfidence));
    return apiFetch<ReserveBlock[]>(`/api/reserves/blocks?${params}`);
  },
  getDrillLogs: (mineId?: number) =>
    apiFetch<DrillLog[]>(`/api/reserves/drill-logs${mineId ? `?mine_id=${mineId}` : ''}`),
};

// ── Production API ─────────────────────────────
export const productionAPI = {
  getRecords: (mineId?: number) =>
    apiFetch<ProductionRecord[]>(`/api/production/records${mineId ? `?mine_id=${mineId}` : ''}`),
  getSummary: () => apiFetch<ProductionSummary[]>('/api/production/summary'),
  getEquipment: (mineId?: number) =>
    apiFetch<Equipment[]>(`/api/production/equipment${mineId ? `?mine_id=${mineId}` : ''}`),
};

// ── Predictions API ────────────────────────────
export const predictionsAPI = {
  getShortfalls: (mineId?: number, riskLevel?: string) => {
    const params = new URLSearchParams();
    if (mineId) params.set('mine_id', String(mineId));
    if (riskLevel) params.set('risk_level', riskLevel);
    return apiFetch<ShortfallPrediction[]>(`/api/predictions/shortfalls?${params}`);
  },
  getRiskCalendar: (mineId?: number) =>
    apiFetch<RiskCalendarDay[]>(`/api/predictions/risk-calendar${mineId ? `?mine_id=${mineId}` : ''}`),
  runWhatIf: (request: WhatIfRequest) =>
    apiFetch<WhatIfResponse>('/api/predictions/what-if', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  getModelAccuracy: () => apiFetch<ModelAccuracy>('/api/predictions/model-accuracy'),
};

// ── Recommendations API ────────────────────────
export const recommendationsAPI = {
  getActions: (mineId?: number, priority?: string) => {
    const params = new URLSearchParams();
    if (mineId) params.set('mine_id', String(mineId));
    if (priority) params.set('priority', priority);
    return apiFetch<CorrectiveAction[]>(`/api/recommendations/actions?${params}`);
  },
  getHistory: () => apiFetch<ActionHistory[]>('/api/recommendations/history'),
  getCategories: () => apiFetch<ActionCategory[]>('/api/recommendations/categories'),
  markImplemented: (actionId: number) =>
    apiFetch<{ success: boolean; message: string }>(`/api/recommendations/actions/${actionId}/implement`, {
      method: 'POST',
    }),
};

// ── Satellite API ──────────────────────────────
export const satelliteAPI = {
  getIndices: (mineId?: number) =>
    apiFetch<SatelliteIndexRecord[]>(`/api/satellite/indices${mineId ? `?mine_id=${mineId}` : ''}`),
  getHeatmap: (mineId: number, indexType?: string) =>
    apiFetch<HeatmapData>(`/api/satellite/heatmap?mine_id=${mineId}&index_type=${indexType || 'iron_oxide_ratio'}`),
  getMineLocations: () => apiFetch<MineLocation[]>('/api/satellite/mines-locations'),
};

// ── Exploration API (ANVESHA Active Exploration & 3D Orebody) ──
export const explorationAPI = {
  getDrillCandidates: (mineId?: number, priority?: string) => {
    const params = new URLSearchParams();
    if (mineId) params.set('mine_id', String(mineId));
    if (priority) params.set('priority', priority);
    return apiFetch<DrillCandidatesResponse>(`/api/exploration/drill-candidates?${params}`);
  },
  getDrillCandidateDetail: (siteId: string) =>
    apiFetch<DrillCandidate>(`/api/exploration/drill-candidates/${siteId}`),
  reviewDrillCandidate: (
    siteId: string,
    action: 'approve' | 'reject' | 'request_evidence',
    reviewerName?: string,
    comments?: string
  ) => {
    const params = new URLSearchParams();
    params.set('action', action);
    if (reviewerName) params.set('reviewer_name', reviewerName);
    if (comments) params.set('comments', comments);
    return apiFetch<{ success: boolean; site_id: string; status: string; message: string }>(
      `/api/exploration/drill-candidates/${siteId}/review?${params}`,
      { method: 'POST' }
    );
  },
  get3DOrebody: (mineId: number = 1) =>
    apiFetch<Orebody3DResponse>(`/api/exploration/3d-orebody?mine_id=${mineId}`),
  getUncertaintyGrid: (mineId: number = 1) =>
    apiFetch<UncertaintyGridResponse>(`/api/exploration/uncertainty?mine_id=${mineId}`),
};

// ── Models Registry API ────────────────────────
export const modelsAPI = {
  getModels: () => apiFetch<ModelsListResponse>('/api/models/'),
  getModelDetails: (modelId: string) => apiFetch<RegisteredModel>(`/api/models/${modelId}`),
  getModelDrift: (modelId: string) => apiFetch<ModelDriftResponse>(`/api/models/${modelId}/drift`),
};

// ── Data Quality API ───────────────────────────
export const dataQualityAPI = {
  getSources: () => apiFetch<DataSourcesResponse>('/api/data-quality/sources'),
  getQualityMetrics: () => apiFetch<DataQualityMetrics>('/api/data-quality/quality-metrics'),
};

// ── Audit API ──────────────────────────────────
export const auditAPI = {
  getAuditLogs: () => apiFetch<AuditLogsResponse>('/api/audit/'),
  createAuditLog: (entry: AuditEntryInput) =>
    apiFetch<{ success: boolean; log_id: number; entry: AuditLogEntry }>('/api/audit/', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
};

// ── Type Definitions ───────────────────────────

export interface DashboardKPIs {
  total_reserves_mt: number;
  current_production_rate: number;
  production_target: number;
  active_alerts: number;
  equipment_utilization: number;
  avg_ore_grade: number;
  mines_count: number;
  risk_mines_count: number;
}

export interface MineStatus {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  risk_level: string;
  production_percent: number;
  estimated_reserves: number;
}

export interface ProductionTrendPoint {
  month: string;
  target: number;
  actual: number;
  shortfall: number;
}

export interface Alert {
  id: number;
  mine_name: string;
  risk_level: string;
  message: string;
  target_date: string;
  created_at: string;
}

export interface ReserveSummary {
  mine_id: number;
  mine_name: string;
  total_estimated_tonnage: number;
  avg_grade: number;
  avg_confidence: number;
  num_blocks: number;
}

export interface ReserveBlock {
  id: number;
  mine_id: number;
  block_id: string;
  center_lat: number;
  center_lon: number;
  polygon: number[][];
  estimated_tonnage: number;
  mn_grade_percent: number;
  confidence_score: number;
  estimation_method: string;
}

export interface DrillLog {
  id: number;
  mine_id: number;
  borehole_id: string;
  latitude: number;
  longitude: number;
  depth_m: number;
  mn_grade_percent: number;
  fe_grade_percent: number;
  rock_type: string;
  formation: string;
}

export interface ProductionRecord {
  id: number;
  mine_id: number;
  mine_name: string;
  date: string;
  planned_qty_tonnes: number;
  actual_qty_tonnes: number;
  ore_grade_percent: number;
  waste_tonnes: number;
  blasting_done: boolean;
  blasting_delay_hours: number;
}

export interface ProductionSummary {
  mine_id: number;
  mine_name: string;
  total_planned: number;
  total_actual: number;
  shortfall_percent: number;
  avg_grade: number;
}

export interface Equipment {
  id: number;
  unique_id?: string;
  mine_id: number;
  mine_name?: string;
  equipment_type: string;
  model_name: string;
  capacity?: string;
  status: 'active' | 'idle' | 'maintenance' | 'breakdown' | string;
  utilization_percent: number;
  hours_today: number;
  downtime_reason: string | null;
  last_maintenance?: string | null;
  next_maintenance?: string | null;
}

export interface ShortfallPrediction {
  id: number;
  mine_id: number;
  mine_name: string;
  target_date: string;
  planned_qty_tonnes: number;
  predicted_qty_tonnes: number;
  shortfall_tonnes: number;
  risk_level: string;
  confidence_score: number;
  contributing_factors: Record<string, number>;
}

export interface RiskCalendarDay {
  date: string;
  risk_level: string;
  predicted_production_percent: number;
}

export interface WhatIfRequest {
  mine_id: number;
  days_ahead: number;
  equipment_down: number;
  rainfall_mm: number;
  blasting_delay_hours: number;
  extra_shift: boolean;
}

export interface WhatIfResponse {
  scenario?: string;
  baseline_production: number;
  adjusted_production: number;
  impact_tonnes: number;
  impact_percent: number;
  risk_level: string;
  breakdown: Record<string, number>;
}

export interface ModelAccuracy {
  scatter_data: { actual: number; predicted: number; date: string }[];
  metrics: {
    rmse: number;
    mae: number;
    r2_score: number;
    accuracy_within_10_percent: number;
  };
}

export interface CorrectiveAction {
  id: number;
  prediction_id: number;
  mine_id: number;
  mine_name: string;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  estimated_impact_tonnes: number;
  estimated_impact_percent: number;
  implementation_steps: string[];
  category: string;
  is_implemented: boolean;
}

export interface ActionHistory {
  id: number;
  mine_name: string;
  action: string;
  date_implemented: string;
  predicted_impact_tonnes: number;
  actual_impact_tonnes: number;
  outcome: string;
}

export interface ActionCategory {
  category: string;
  count: number;
  icon: string;
}

export interface SatelliteIndexRecord {
  id: number;
  mine_id: number;
  mine_name: string;
  date: string;
  satellite_source: string;
  ndvi: number;
  ndmi: number;
  lst: number;
  iron_oxide_ratio: number;
  clay_mineral_index: number;
  mn_probability: number;
}

export interface HeatmapData {
  mine_id: number;
  index_type: string;
  points: { lat: number; lon: number; value: number }[];
  min_value: number;
  max_value: number;
  center: { lat: number; lon: number };
}

export interface MineLocation {
  id: number;
  name: string;
  lat: number;
  lon: number;
  district: string;
  state: string;
  type: string;
}

// ── ANVESHA Exploration Types ───────────────────
export interface DrillCandidate {
  site_id: string;
  mine_id: number;
  mine_name: string;
  latitude: number;
  longitude: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_mn_probability: number;
  expected_grade_percent: number;
  uncertainty_level: 'low' | 'medium' | 'high';
  expected_uncertainty_reduction_percent: number;
  value_of_information_score: number;
  estimated_drilling_cost_inr: number;
  target_depth_m: number;
  accessibility: string;
  geological_formation: string;
  surface_spectral_evidence: string;
  nearest_borehole_id: string;
  distance_to_nearest_borehole_m: number;
  primary_reason: string;
  review_status: 'pending_review' | 'approved' | 'rejected' | 'needs_evidence';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_comments?: string | null;
}

export interface DrillCandidatesResponse {
  count: number;
  model_version: string;
  algorithm: string;
  candidates: DrillCandidate[];
}

export interface OrebodyVoxel {
  x: number;
  y: number;
  z: number;
  size_m: [number, number, number];
  mn_probability: number;
  estimated_grade_percent: number;
  uncertainty: number;
  is_orebody: boolean;
}

export interface BoreholeTrace {
  id: string;
  surface_coords: [number, number, number];
  depth_m: number;
  collar_elevation_m: number;
  assay_intercepts: {
    from_m: number;
    to_m: number;
    lithology: string;
    mn_percent: number;
  }[];
}

export interface Orebody3DResponse {
  mine_id: number;
  mine_name: string;
  datum_crs: string;
  model_version: string;
  voxel_dimensions_m: [number, number, number];
  total_voxels: number;
  voxels: OrebodyVoxel[];
  borehole_traces: BoreholeTrace[];
}

export interface UncertaintyPoint {
  latitude: number;
  longitude: number;
  inferred_probability: number;
  uncertainty_score: number;
  confidence_level: 'low' | 'medium' | 'high';
  supporting_boreholes_count: number;
  evidence_coverage: 'good' | 'moderate' | 'sparse';
  is_drilling_target: boolean;
}

export interface UncertaintyGridResponse {
  mine_id: number;
  mine_name: string;
  mean_uncertainty: number;
  high_uncertainty_target_zones: number;
  grid_points: UncertaintyPoint[];
}

// ── Models Registry Types ───────────────────────
export interface RegisteredModel {
  model_id: string;
  name: string;
  version: string;
  category: string;
  algorithm: string;
  training_date: string;
  validation_date: string;
  status: string;
  dataset_version: string;
  metrics: Record<string, number>;
  drift_status: string;
  approved_by: string;
  approval_date: string;
}

export interface ModelsListResponse {
  count: number;
  registry_health: string;
  models: RegisteredModel[];
}

export interface ModelDriftResponse {
  model_id: string;
  checked_at: string;
  overall_drift_status: string;
  feature_drift_score: number;
  prediction_drift_score: number;
  data_completeness_drift: number;
  features: { feature: string; drift_metric: string; status: string }[];
}

// ── Data Quality Types ──────────────────────────
export interface DataSource {
  source_id: string;
  name: string;
  type: string;
  resolution: string;
  coverage: string;
  last_acquisition: string;
  last_processed: string;
  quality_score_percent: number;
  status: string;
  cloud_cover_percent: number;
}

export interface DataSourcesResponse {
  count: number;
  last_audit: string;
  overall_health: string;
  sources: DataSource[];
}

export interface DataQualityMetrics {
  completeness_score_percent: number;
  freshness_index: string;
  schema_validity_percent: number;
  spatial_coverage_percent: number;
  outlier_rate_percent: number;
  missing_values_percent: number;
  total_records_analyzed: number;
  data_quarantine_records: number;
}

// ── Audit Types ─────────────────────────────────
export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  previous_state: string;
  new_state: string;
  reason: string;
  model_version: string;
  data_version: string;
}

export interface AuditLogsResponse {
  count: number;
  logs: AuditLogEntry[];
}

export interface AuditEntryInput {
  user: string;
  action: string;
  entity: string;
  previous_state: string;
  new_state: string;
  reason: string;
  model_version?: string;
  data_version?: string;
}

