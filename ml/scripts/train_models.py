"""
Train ML Models for MOIL Manganese Intelligence:
1. Production Shortfall Predictor (XGBoost/RandomForest Regressor & Risk Classifier)
2. Reserve Ore Grade & Prospectivity Estimator (Spatial & Remote Sensing Ensemble)

Uses the scientifically calibrated synthetic dataset in ml/data/processed/
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)


def train_shortfall_model():
    print("\n" + "=" * 60)
    print("📈 TRAINING PRODUCTION SHORTFALL PREDICTION MODEL")
    print("=" * 60)

    # 1. Load datasets
    prod_df = pd.read_csv(os.path.join(DATA_DIR, 'production_records.csv'))
    weather_df = pd.read_csv(os.path.join(DATA_DIR, 'weather_data.csv'))
    equip_df = pd.read_csv(os.path.join(DATA_DIR, 'equipment_logs.csv'))
    mines_df = pd.read_csv(os.path.join(DATA_DIR, 'mines.csv'))

    # Aggregate daily equipment downtime per mine
    eq_summary = equip_df.groupby(['date']).agg({
        'downtime_hours': 'sum',
        'hours_operated': 'sum',
        'fuel_consumed_liters': 'sum'
    }).reset_index()

    # Merge production with weather
    merged = pd.merge(prod_df, weather_df, on=['mine_id', 'date'], how='left')
    merged = pd.merge(merged, mines_df[['id', 'mine_type', 'elevation_m']], left_on='mine_id', right_on='id', how='left')

    # Date-based seasonal features
    merged['date_dt'] = pd.to_datetime(merged['date'])
    merged['month'] = merged['date_dt'].dt.month
    merged['day_of_week'] = merged['date_dt'].dt.dayofweek
    merged['is_monsoon'] = merged['month'].isin([6, 7, 8, 9]).astype(int)
    merged['is_peak_monsoon'] = merged['month'].isin([7, 8]).astype(int)

    # Calculate shortfall percentage and categorize risk level
    merged['shortfall_ratio'] = merged['shortfall_tonnes'] / np.maximum(merged['planned_qty_tonnes'], 1.0)
    
    def categorize_risk(ratio):
        if ratio < 0.10:
            return 'low'
        elif ratio < 0.25:
            return 'medium'
        elif ratio < 0.45:
            return 'high'
        else:
            return 'critical'

    merged['risk_level'] = merged['shortfall_ratio'].apply(categorize_risk)

    # Features for predicting shortfall
    features = [
        'planned_qty_tonnes',
        'ore_grade_percent',
        'stripping_ratio',
        'blasting_delay_hours',
        'rainfall_mm',
        'temperature_max_c',
        'humidity_percent',
        'soil_moisture_index',
        'month',
        'is_monsoon',
        'is_peak_monsoon',
        'elevation_m'
    ]

    # Convert mine_type to categorical
    merged['is_opencast'] = (merged['mine_type'] == 'opencast').astype(int)
    features.append('is_opencast')

    # Drop NaNs
    clean_df = merged.dropna(subset=features + ['shortfall_tonnes', 'risk_level'])

    X = clean_df[features]
    y_reg = clean_df['shortfall_tonnes']
    y_clf = clean_df['risk_level']

    X_train, X_test, y_train_reg, y_test_reg, y_train_clf, y_test_clf = train_test_split(
        X, y_reg, y_clf, test_size=0.20, random_state=42
    )

    # Train Regressor (predicts exact shortfall tonnes)
    regressor = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    regressor.fit(X_train, y_train_reg)

    y_pred_reg = regressor.predict(X_test)
    r2 = r2_score(y_test_reg, y_pred_reg)
    mae = mean_absolute_error(y_test_reg, y_pred_reg)

    print(f"  ✓ Shortfall Regressor R² Score: {r2:.4f}")
    print(f"  ✓ Mean Absolute Error (MAE): {mae:.2f} tonnes")

    # Train Classifier (predicts risk level low/medium/high/critical)
    classifier = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    classifier.fit(X_train, y_train_clf)

    y_pred_clf = classifier.predict(X_test)
    acc = accuracy_score(y_test_clf, y_pred_clf)
    print(f"  ✓ Risk Level Classifier Accuracy: {acc * 100:.2f}%")

    # Feature importances
    importances = pd.Series(regressor.feature_importances_, index=features).sort_values(ascending=False)
    print("\n  Top Shortfall Predictor Factors:")
    for feat, imp in importances.head(6).items():
        print(f"    • {feat:25s}: {imp * 100:.1f}%")

    # Save model artifacts
    joblib.dump({
        'regressor': regressor,
        'classifier': classifier,
        'features': features,
        'metrics': {'r2': round(r2, 4), 'mae': round(mae, 2), 'accuracy': round(acc, 4)}
    }, os.path.join(MODEL_DIR, 'shortfall_predictor.joblib'))

    print(f"\n  💾 Model saved to: {os.path.join(MODEL_DIR, 'shortfall_predictor.joblib')}")


def train_reserve_model():
    print("\n" + "=" * 60)
    print("💎 TRAINING RESERVE GRADE & PROSPECTIVITY ESTIMATOR")
    print("=" * 60)

    drill_df = pd.read_csv(os.path.join(DATA_DIR, 'drill_logs.csv'))

    features = [
        'depth_m',
        'fe_grade_percent',
        'sio2_percent',
        'p_percent',
        'bulk_density_t_m3',
        'core_recovery_percent'
    ]

    clean_df = drill_df.dropna(subset=features + ['mn_grade_percent'])
    X = clean_df[features]
    y = clean_df['mn_grade_percent']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"  ✓ Ore Grade Estimator R² Score: {r2:.4f}")
    print(f"  ✓ Mn% Grade MAE: ±{mae:.2f}%")

    joblib.dump({
        'model': model,
        'features': features,
        'metrics': {'r2': round(r2, 4), 'mae': round(mae, 2)}
    }, os.path.join(MODEL_DIR, 'reserve_estimator.joblib'))

    print(f"\n  💾 Model saved to: {os.path.join(MODEL_DIR, 'reserve_estimator.joblib')}")


if __name__ == '__main__':
    train_shortfall_model()
    train_reserve_model()
    print("\n" + "=" * 60)
    print("🎯 ML TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 60)
