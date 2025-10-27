// src/types/cropData.ts
// TypeScript types for crop yield data

export interface WeatherData {
  temperature_avg: number;
  temperature_min?: number;
  temperature_max?: number;
  precipitation: number;
  humidity: number;
  wind_speed?: number;
  solar_radiation?: number;
}

export interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface SatelliteData {
  ndvi?: number;
  evi?: number;
}

export interface CropYieldRecord {
  year: number;
  state: string;
  crop: string;
  yield: number;
  weather: WeatherData;
  soil: SoilData;
  satellite?: SatelliteData;
}

export interface ProcessedCropData {
  Year: number;
  State: string;
  Crop: string;
  Yield: number;
  Temperature_Avg: number;
  Temperature_Min?: number;
  Temperature_Max?: number;
  Precipitation: number;
  Humidity: number;
  Wind_Speed?: number;
  Solar_Radiation?: number;
  NDVI?: number;
  EVI?: number;
  LST_Day?: number;
  Soil_Moisture?: number;
  Soil_pH: number;
  Nitrogen: number;
  Phosphorus: number;
  Potassium: number;
  // Engineered features
  Temperature_Range?: number;
  Precip_Efficiency?: number;
  NP_Ratio?: number;
  NK_Ratio?: number;
  NDVI_EVI_Ratio?: number;
  Thermal_Stress?: number;
  Annual_Rainfall_Monthly?: number;
  Annual_Temp_Monthly?: number;
  Total_Irrigation_Hours?: number;
  Avg_Soil_Moisture?: number;
  Avg_Price_per_Ton?: number;
  Avg_Export_Demand?: number;
  Avg_Supply_Demand_Ratio?: number;
}

export interface DatasetMetadata {
  total_records: number;
  crops: string[];
  states: string[];
  years: {
    min: number;
    max: number;
  };
  yield_range: {
    min: number;
    max: number;
  };
  features: {
    weather: string[];
    soil: string[];
    satellite: string[];
  };
  data_sources: string[];
  processing_date: string;
}

export interface DataFilters {
  crop?: string;
  state?: string;
  year?: number;
  yearRange?: {
    min: number;
    max: number;
  };
}

export interface DataSummary {
  totalRecords: number;
  avgYield: number;
  yieldRange: {
    min: number;
    max: number;
  };
  cropsCount: number;
  statesCount: number;
}

export type CropType = 'Rice' | 'Wheat' | 'Soybean' | 'Maize' | 'Barley' | 'Cotton' | 'Sorghum';
export type StateName = 'Punjab' | 'Maharashtra' | 'Haryana' | 'Uttar Pradesh' | 'Rajasthan' | 'Gujarat';

export interface ChartDataPoint {
  year: number;
  state: string;
  crop: string;
  yield: number;
  [key: string]: number | string;
}

export interface PredictionInput {
  crop: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface PredictionResult {
  predicted_yield: number;
  confidence: number;
  feature_importances: Record<string, number>;
  model_metrics: {
    r2_score: number;
    mse: number;
    rmse: number;
  };
}
