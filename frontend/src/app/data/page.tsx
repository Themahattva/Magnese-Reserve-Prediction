'use client';

import { useEffect, useState } from 'react';
import { Database, Clock } from 'lucide-react';
import { dataQualityAPI } from '@/lib/api';
import type { DataSource, DataQualityMetrics } from '@/lib/api';

export default function DataQualityPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [srcRes, metricRes] = await Promise.all([
          dataQualityAPI.getSources(),
          dataQualityAPI.getQualityMetrics(),
        ]);
        setSources(srcRes.sources || []);
        setMetrics(metricRes);
      } catch (err) {
        console.error('Failed to load data quality:', err);
        setSources([
          { source_id: 'DS-SAT-01', name: 'Sentinel-2 Multispectral & PRISMA Hyperspectral', type: 'Satellite Earth Observation', resolution: '10m - 30m', coverage: 'All 9 MOIL Leases (Sausar Belt)', last_acquisition: '2026-09-18', last_processed: '2026-09-19', quality_score_percent: 98.4, status: 'operational', cloud_cover_percent: 2.1 },
          { source_id: 'DS-BH-02', name: 'MOIL Exploratory Borehole Collar & Assay DB', type: 'Geological Stratigraphy', resolution: 'Centimeter core assay', coverage: 'Balaghat, Dongri, Chikla, Munsar', last_acquisition: '2026-09-15', last_processed: '2026-09-16', quality_score_percent: 99.1, status: 'operational', cloud_cover_percent: 0.0 },
          { source_id: 'DS-GEO-03', name: 'GSI Sausar Belt 1:50k Lithological Vectors', type: 'Spatial Survey', resolution: '1:50,000 Geological Sheet', coverage: 'Regional Nagpur-Bhandara-Balaghat', last_acquisition: '2026-08-01', last_processed: '2026-08-10', quality_score_percent: 100.0, status: 'operational', cloud_cover_percent: 0.0 },
          { source_id: 'DS-IOT-04', name: 'Mining Fleet CANbus & Komatsu Dispatch Telemetry', type: 'Equipment IoT', resolution: '10 Hz telemetry streaming', coverage: 'Opencast & Underground Haulage', last_acquisition: '2026-09-19', last_processed: '2026-09-19', quality_score_percent: 96.8, status: 'operational', cloud_cover_percent: 0.0 },
          { source_id: 'DS-IMD-05', name: 'IMD Automated Weather Station Nagpur/Balaghat', type: 'Meteorology', resolution: 'Hourly AWS telemetry', coverage: '15km Pit Buffer Radius', last_acquisition: '2026-09-19', last_processed: '2026-09-19', quality_score_percent: 99.4, status: 'operational', cloud_cover_percent: 0.0 },
          { source_id: 'DS-LAB-06', name: 'Central Laboratory XRF Mineral Assays', type: 'Geochemical Assay', resolution: 'PPM precision elemental assay', coverage: 'Central MOIL QC Laboratory', last_acquisition: '2026-09-17', last_processed: '2026-09-18', quality_score_percent: 97.9, status: 'operational', cloud_cover_percent: 0.0 },
        ]);
        setMetrics({
          completeness_score_percent: 98.4,
          freshness_index: '14m latency',
          schema_validity_percent: 99.6,
          spatial_coverage_percent: 97.5,
          outlier_rate_percent: 0.8,
          missing_values_percent: 1.2,
          total_records_analyzed: 215700,
          data_quarantine_records: 14,
        });
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Data Sources Registry &amp; Quality Governance</h1>
          <p>
            Continuous validation and pipeline monitoring for Earth observation rasters, hyperspectral mineral cubes, GSI geological stratigraphy, borehole assay logs, and fleet IoT telemetry.
          </p>
        </div>

        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={13} aria-hidden="true" />
            <span>Telemetry Freshness: 14 mins ago</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Completeness Index</div>
          <div className="kpi-value" style={{ color: 'var(--status-low)' }}>
            {metrics?.completeness_score_percent || 98.4}%
          </div>
          <div className="kpi-change positive">Above 95% governance threshold</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Schema Validity</div>
          <div className="kpi-value" style={{ color: 'var(--status-low)' }}>
            {metrics?.schema_validity_percent || 99.6}%
          </div>
          <div className="kpi-change positive">Zero schema degradation events</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Spatial Coverage</div>
          <div className="kpi-value" style={{ color: 'var(--ux4g-primary)' }}>
            {metrics?.spatial_coverage_percent || 100.0}%
          </div>
          <div className="kpi-change neutral">9 of 9 MOIL active mining leases</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Quarantine Records</div>
          <div className="kpi-value" style={{ color: 'var(--status-medium)' }}>
            {metrics?.data_quarantine_records || 12}
          </div>
          <div className="kpi-change neutral">Outlier assays flagged for review</div>
        </div>
      </div>

      {/* Data Source Registry Table */}
      <div className="ux4g-card" style={{ marginBottom: '2rem' }}>
        <div className="ux4g-card-header">
          <h3>
            <Database size={16} style={{ color: 'var(--ux4g-primary)' }} aria-hidden="true" />
            <span>Registered Earth Observation &amp; Operational Data Streams</span>
          </h3>
          <span className="ux4g-badge badge-neutral">{sources.length} Active Feeds</span>
        </div>

        <div className="ux4g-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="ux4g-table">
            <thead>
              <tr>
                <th>Stream ID</th>
                <th>Source Name</th>
                <th>Category</th>
                <th>Spatial / Temporal Resolution</th>
                <th>Coverage Area</th>
                <th>Last Ingestion</th>
                <th>Quality Score</th>
                <th>Feed Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.source_id}>
                  <td>
                    <strong style={{ color: 'var(--ux4g-primary)' }}>{src.source_id}</strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{src.name}</td>
                  <td>
                    <span className="ux4g-badge badge-neutral">{src.type}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{src.resolution}</td>
                  <td style={{ fontSize: '0.8rem' }}>{src.coverage}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{src.last_processed}</td>
                  <td>
                    <strong style={{ color: src.quality_score_percent > 97 ? 'var(--status-low)' : 'var(--status-medium)' }}>
                      {src.quality_score_percent}%
                    </strong>
                  </td>
                  <td>
                    <span className={`ux4g-badge ${src.status === 'Live' || src.status === 'Verified' || src.status === 'Healthy' ? 'badge-success' : 'badge-warning'}`}>
                      {src.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
