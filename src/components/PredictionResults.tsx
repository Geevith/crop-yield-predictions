import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { supabase } from "@/integrations/supabase/client"; // Step 2: Supabase import removed/commented out
import EnhancedVisualization from "@/components/EnhancedVisualization"; // Import the enhanced component
// Keep types for structure if needed elsewhere, or redefine locally if Supabase types are fully removed
// import { Database } from "@/integrations/supabase/types";


// --- Step 3: Define Sample Data ---
// Define interfaces locally
interface Prediction {
  id: string;
  temperature: number | null;
  rainfall: number | null;
  fertilizer?: number | null;
  soil_ph: number | null;
  humidity: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  predicted_crop: string | null;
  predicted_yield_lr: number | null;
  predicted_yield_rf: number | null;
  best_model: string | null;
  created_at: string;
  feature_importances?: string | null; // Keep as JSON string matching the previous structure
  confidence_score?: number | null;
}


interface ModelMetrics {
  model_name: string;
  r2_score: number | null;
  mae: number | null;
  rmse: number | null;
  evaluation_method: string | null;
  tuned_parameters: string | null;
}


// Sample data constants
const samplePredictionData: Prediction = {
  id: "local-sample-1",
  temperature: 25.5,
  rainfall: 800,
  fertilizer: 120,
  soil_ph: 6.5,
  humidity: 65,
  nitrogen: 110,
  phosphorus: 55,
  potassium: 160,
  predicted_crop: "Wheat",
  predicted_yield_lr: 3800, // Using kg/ha example values
  predicted_yield_rf: 4100,
  best_model: "Random Forest",
  created_at: new Date().toISOString(),
  // Feature importances stored as a JSON string
  feature_importances: JSON.stringify({
    'temperature': 0.15,
    'rainfall': 0.22,
    'humidity': 0.08,
    'soil_ph': 0.06,
    'nitrogen': 0.12,
    'phosphorus': 0.08,
    'potassium': 0.07,
    'fertilizer': 0.09, // Added fertilizer based on sample structure
    'temp_rainfall_interaction': 0.10,
    'ph_fertilizer_interaction': 0.05,
  }),
  confidence_score: 0.85
};


const sampleModelMetrics: ModelMetrics[] = [
   { model_name: 'Linear Regression', r2_score: 0.75, mae: 500, rmse: 700, evaluation_method: 'Local Sample Data', tuned_parameters: '{}' },
   { model_name: 'Random Forest', r2_score: 0.85, mae: 300, rmse: 500, evaluation_method: 'Local Sample Data', tuned_parameters: "{'n_estimators': 100}" }
];
// --- END Sample Data ---


interface PredictionResultsProps {
  refreshTrigger: number;
}


export const PredictionResults = ({ refreshTrigger }: PredictionResultsProps) => {
  // --- Step 4: Initialize State with Sample Data ---
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(samplePredictionData);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>(sampleModelMetrics);
  // State to hold the *parsed* feature importances object
  const [featureImportances, setFeatureImportances] = useState<Record<string, number> | null>(null);
  // --- END Initialize State ---


  // --- Step 5: Modify useEffect ---
  useEffect(() => {
    // Parse the feature importances string from the sample data state
    console.log("Effect running. Using sample prediction:", latestPrediction);
    if (latestPrediction?.feature_importances && typeof latestPrediction.feature_importances === 'string') {
      try {
        const parsed = JSON.parse(latestPrediction.feature_importances);
        console.log("Parsed sample feature importances:", parsed);
        setFeatureImportances(parsed); // Store the parsed object
      } catch (e) {
        console.error("Error parsing sample feature importances JSON:", e, "Raw data:", latestPrediction.feature_importances);
        setFeatureImportances(null); // Set to null if parsing fails
      }
    } else {
      console.warn("Sample feature_importances field is missing, null, or not a string:", latestPrediction?.feature_importances);
      setFeatureImportances(null); // Ensure it's null if not parseable
    }


    // Supabase fetch calls are removed. This effect now just handles parsing the static sample data.


  }, [refreshTrigger, latestPrediction]); // Depend on state holding sample data
  // --- END Modify useEffect ---



  // --- Step 6: Remove Fetch Functions ---
  /*
  const fetchLatestPrediction = async () => {
    // Original Supabase fetch logic was here...
  };


  const fetchModelMetrics = async () => {
    // Original Supabase fetch logic was here...
  };
  */
  // --- END Remove Fetch Functions ---



  // --- Step 7: Keep the Rest (Render Logic) ---
  if (!latestPrediction) {
    // This is less likely to be hit now, but good fallback
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Displaying sample prediction results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Sample data could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }


  // Ensure yield values are numbers for chartData if they might be null
  const chartData = [
    {
      name: "Linear Regression",
      yield: Number(latestPrediction.predicted_yield_lr) || 0,
    },
    {
      name: "Random Forest",
      yield: Number(latestPrediction.predicted_yield_rf) || 0,
    },
  ];


  return (
    <div className="space-y-6">
      {/* EnhancedVisualization now receives the sample data from state */}
      {/* featureImportances prop now receives the *parsed object* */}
      <EnhancedVisualization
        prediction={latestPrediction}
        modelMetrics={modelMetrics}
        featureImportances={featureImportances} // Pass the parsed state object
      />


      {/* Optional: Model Performance Metrics Summary Table */}
      {modelMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Metrics Summary</CardTitle>
            <CardDescription>Sample training results overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>R² Score</TableHead>
                  <TableHead>MAE (kg/ha)</TableHead>
                  <TableHead>RMSE (kg/ha)</TableHead>
                  <TableHead>Evaluation Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelMetrics.map((metric) => (
                  <TableRow key={metric.model_name}>
                    <TableCell className="font-medium">{metric.model_name}</TableCell>
                    <TableCell>{metric.r2_score?.toFixed(4) ?? 'N/A'}</TableCell>
                    <TableCell>{metric.mae?.toFixed(1) ?? 'N/A'}</TableCell>
                    <TableCell>{metric.rmse?.toFixed(1) ?? 'N/A'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{metric.evaluation_method ?? 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Display sample parameters */}
            {modelMetrics.find(m => m.model_name === 'Random Forest' && m.tuned_parameters) && (
              <p className="text-xs text-muted-foreground mt-2">
                Sample RF Params: {modelMetrics.find(m => m.model_name === 'Random Forest')?.tuned_parameters}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


// Ensure interfaces are exported if needed by other files, or keep them local if not.
// export type { Prediction, ModelMetrics };
