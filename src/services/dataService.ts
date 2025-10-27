// src/services/dataService.ts
// Service for loading and managing crop yield data

export interface CropYieldData {
  year: number;
  state: string;
  crop: string;
  yield: number;
  temperature_avg: number;
  precipitation: number;
  humidity: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
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

class DataService {
  private metadata: DatasetMetadata | null = null;
  private cropData: CropYieldData[] | null = null;

  async loadMetadata(): Promise<DatasetMetadata> {
    if (this.metadata) return this.metadata;

    try {
      const response = await fetch('/data/dataset_metadata.json');
      if (!response.ok) throw new Error('Failed to load metadata');

      this.metadata = await response.json();
      return this.metadata;
    } catch (error) {
      console.error('Error loading metadata:', error);
      throw error;
    }
  }

  async loadAllData(): Promise<CropYieldData[]> {
    if (this.cropData) return this.cropData;

    try {
      const response = await fetch('/data/crop_yield_sample.json');
      if (!response.ok) throw new Error('Failed to load crop data');

      this.cropData = await response.json();
      return this.cropData;
    } catch (error) {
      console.error('Error loading crop data:', error);
      throw error;
    }
  }

  async loadDataByCrop(crop: string): Promise<CropYieldData[]> {
    try {
      const response = await fetch(`/data/crop_yield_${crop.toLowerCase()}.json`);
      if (!response.ok) throw new Error(`Failed to load ${crop} data`);

      return await response.json();
    } catch (error) {
      console.error(`Error loading ${crop} data:`, error);
      throw error;
    }
  }

  async loadDataByState(state: string): Promise<CropYieldData[]> {
    try {
      const stateFormatted = state.toLowerCase().replace(' ', '_');
      const response = await fetch(`/data/crop_yield_${stateFormatted}.json`);
      if (!response.ok) throw new Error(`Failed to load ${state} data`);

      return await response.json();
    } catch (error) {
      console.error(`Error loading ${state} data:`, error);
      throw error;
    }
  }

  // Get unique values for filters
  async getAvailableCrops(): Promise<string[]> {
    const metadata = await this.loadMetadata();
    return metadata.crops;
  }

  async getAvailableStates(): Promise<string[]> {
    const metadata = await this.loadMetadata();
    return metadata.states;
  }

  async getYearRange(): Promise<{ min: number; max: number }> {
    const metadata = await this.loadMetadata();
    return metadata.years;
  }

  // Filter data based on criteria
  async getFilteredData(filters: {
    crop?: string;
    state?: string;
    year?: number;
    yearRange?: { min: number; max: number };
  }): Promise<CropYieldData[]> {
    let data = await this.loadAllData();

    if (filters.crop) {
      data = data.filter(item => item.crop === filters.crop);
    }

    if (filters.state) {
      data = data.filter(item => item.state === filters.state);
    }

    if (filters.year) {
      data = data.filter(item => item.year === filters.year);
    }

    if (filters.yearRange) {
      data = data.filter(item =>
        item.year >= filters.yearRange!.min && item.year <= filters.yearRange!.max
      );
    }

    return data;
  }

  // Get statistical summary
  async getDataSummary(): Promise<{
    totalRecords: number;
    avgYield: number;
    yieldRange: { min: number; max: number };
    cropsCount: number;
    statesCount: number;
  }> {
    const data = await this.loadAllData();

    const yields = data.map(item => item.yield);

    return {
      totalRecords: data.length,
      avgYield: yields.reduce((sum, yield) => sum + yield, 0) / yields.length,
      yieldRange: {
        min: Math.min(...yields),
        max: Math.max(...yields)
      },
      cropsCount: new Set(data.map(item => item.crop)).size,
      statesCount: new Set(data.map(item => item.state)).size
    };
  }
}

export const dataService = new DataService();
