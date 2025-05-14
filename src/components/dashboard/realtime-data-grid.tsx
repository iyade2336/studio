
"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData } from "./sensor-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sensor-data');
      if (!response.ok) {
        throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
      }
      const data: SensorData[] = await response.json();
      setSensors(data);
    } catch (e) {
      console.error("Error fetching sensor data:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while fetching data.");
      setSensors([]); // Clear sensors on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 15000); // Refresh data every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && sensors.length === 0 && !error) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading Data...
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Sensor Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && sensors.length === 0 ? (
         <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Sensor Data</AlertTitle>
          <AlertDescription>
            No sensor data is currently available. Ensure your devices are connected and sending data.
            The API might be running without any connected devices, or initial data might not have been POSTed yet.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}
