// src/components/CropDataVisualization.tsx
// Component for visualizing processed crop yield data

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, Target, Award, ThermometerSun, Cloud, Droplets } from 'lucide-react';
import { useCropData } from '@/hooks/useCropData';
import { CropYieldData } from '@/services/dataService';

interface CropDataVisualizationProps {
  crop?: string;
  state?: string;
  yearRange?: { min: number; max: number };
}

export const CropDataVisualization: React.FC<CropDataVisualizationProps> = ({
  crop,
  state,
  yearRange
}) => {
  const { data, loading, error, summary } = useCropData({
    crop,
    state,
    yearRange
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No data available for the selected filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = data.map(item => ({
    year: item.year,
    state: item.state,
    crop: item.crop,
    yield: item.yield,
    temperature: item.temperature_avg,
    precipitation: item.precipitation,
    humidity: item.humidity,
    soil_ph: item.soil_ph,
    nitrogen: item.nitrogen,
    phosphorus: item.phosphorus,
    potassium: item.potassium
  }));

  // Yield trend over time
  const yieldTrendData = chartData.reduce((acc, item) => {
    const existing = acc.find(d => d.year === item.year && d.crop === item.crop);
    if (existing) {
      existing.yield = (existing.yield + item.yield) / 2;
      existing.count += 1;
    } else {
      acc.push({
        year: item.year,
        crop: item.crop,
        yield: item.yield,
        temperature: item.temperature,
        precipitation: item.precipitation,
        count: 1
      });
    }
    return acc;
  }, [] as any[]);

  // Weather vs Yield correlation
  const weatherYieldData = chartData.map(item => ({
    yield: item.yield,
    temperature: item.temperature,
    precipitation: item.precipitation,
    humidity: item.humidity
  }));

  // Soil nutrients vs Yield
  const soilYieldData = chartData.map(item => ({
    yield: item.yield,
    nitrogen: item.nitrogen,
    phosphorus: item.phosphorus,
    potassium: item.potassium,
    np_ratio: item.nitrogen / (item.phosphorus + 0.1)
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalRecords}</div>
              <p className="text-xs text-muted-foreground">Data points analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgYield.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">tons per hectare</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yield Range</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.yieldRange.min.toFixed(1)} - {summary.yieldRange.max.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">tons per hectare</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.cropsCount} crops, {summary.statesCount} states
              </div>
              <p className="text-xs text-muted-foreground">Geographic coverage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Yield Trend Over Time</CardTitle>
            <CardDescription>Crop yield patterns by year and crop type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="yield" stroke="#8884d8" strokeWidth={2} name="Yield (tons/ha)" />
                <Line type="monotone" dataKey="temperature" stroke="#82ca9d" strokeWidth={2} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weather vs Yield Correlation */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Impact on Yield</CardTitle>
            <CardDescription>Correlation between weather factors and crop yield</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={weatherYieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="precipitation" name="Precipitation (mm)" />
                <YAxis dataKey="yield" name="Yield (tons/ha)" />
                <ZAxis range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" dataKey="yield" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Soil Nutrients Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Soil Nutrients vs Yield</CardTitle>
            <CardDescription>Impact of soil nutrients on crop productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={soilYieldData.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="np_ratio" />
                <YAxis dataKey="yield" />
                <Tooltip />
                <Bar dataKey="yield" fill="#82ca9d" name="Yield" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temperature Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature Distribution</CardTitle>
            <CardDescription>Temperature patterns across different yields</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={weatherYieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temperature" name="Temperature (°C)" />
                <YAxis dataKey="yield" name="Yield (tons/ha)" />
                <ZAxis range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" dataKey="yield" fill="#ffc658" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Data Points</CardTitle>
          <CardDescription>Latest crop yield measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-left p-2">State</th>
                  <th className="text-left p-2">Crop</th>
                  <th className="text-left p-2">Yield</th>
                  <th className="text-left p-2">Temp</th>
                  <th className="text-left p-2">Rain</th>
                  <th className="text-left p-2">Soil pH</th>
                  <th className="text-left p-2">Nitrogen</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.year}</td>
                    <td className="p-2">{item.state}</td>
                    <td className="p-2">{item.crop}</td>
                    <td className="p-2">{item.yield.toFixed(2)}</td>
                    <td className="p-2">{item.temperature.toFixed(1)}°C</td>
                    <td className="p-2">{item.precipitation.toFixed(0)}mm</td>
                    <td className="p-2">{item.soil_ph.toFixed(1)}</td>
                    <td className="p-2">{item.nitrogen.toFixed(0)}ppm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
