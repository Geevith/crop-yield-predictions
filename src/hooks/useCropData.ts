// src/hooks/useCropData.ts
// Custom hook for managing crop yield data in React components

import { useState, useEffect } from 'react';
import { dataService, CropYieldData, DatasetMetadata } from '../services/dataService';

export interface UseCropDataFilters {
  crop?: string;
  state?: string;
  year?: number;
  yearRange?: { min: number; max: number };
}

export interface UseCropDataResult {
  data: CropYieldData[];
  metadata: DatasetMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  availableCrops: string[];
  availableStates: string[];
  yearRange: { min: number; max: number };
  summary: {
    totalRecords: number;
    avgYield: number;
    yieldRange: { min: number; max: number };
    cropsCount: number;
    statesCount: number;
  } | null;
}

export const useCropData = (filters: UseCropDataFilters = {}): UseCropDataResult => {
  const [data, setData] = useState<CropYieldData[]>([]);
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 2020, max: 2023 });
  const [summary, setSummary] = useState<UseCropDataResult['summary']>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load metadata and available options
      const [metadataResult, cropsResult, statesResult, yearRangeResult, summaryResult] = await Promise.all([
        dataService.loadMetadata(),
        dataService.getAvailableCrops(),
        dataService.getAvailableStates(),
        dataService.getYearRange(),
        dataService.getDataSummary()
      ]);

      setMetadata(metadataResult);
      setAvailableCrops(cropsResult);
      setAvailableStates(statesResult);
      setYearRange(yearRangeResult);
      setSummary(summaryResult);

      // Load filtered data
      const filteredData = await dataService.getFilteredData(filters);
      setData(filteredData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
      console.error('Error in useCropData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.crop, filters.state, filters.year, filters.yearRange]);

  return {
    data,
    metadata,
    loading,
    error,
    refetch: fetchData,
    availableCrops,
    availableStates,
    yearRange,
    summary
  };
};

// Hook for loading specific crop data
export const useCropSpecificData = (crop: string) => {
  return useCropData({ crop });
};

// Hook for loading specific state data
export const useStateSpecificData = (state: string) => {
  return useCropData({ state });
};

// Hook for loading data within a year range
export const useYearRangeData = (yearRange: { min: number; max: number }) => {
  return useCropData({ yearRange });
};
