
"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData as DisplaySensorData } from "./sensor-card"; // Renamed to avoid conflict
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredSensorData } from "@/app/api/sensor-data/route"; // Import type from API
import { useUser } from "@/context/user-context";

// Helper function to derive status
const deriveStatus = (data: StoredSensorData): DisplaySensorData["status"] => {
  if (data.waterLeak) return "danger";
  if (data.temperature !== undefined && (data.temperature > 35 || data.temperature < 5)) return "warning";
  if (data.humidity !== undefined && (data.humidity > 80 || data.humidity < 20)) return "warning";
  return "ok";
};


export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<DisplaySensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();

  const fetchData = async () => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setSensors([]);
      setLoading(false);
      setError(null); // Clear error if user logs out
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sensor-data');
      if (!response.ok) {
        throw new Error(`Failed to fetch sensor data: ${response.statusText}`);
      }
      const data: StoredSensorData[] = await response.json();
      
      const transformedSensors = data.map(apiData => ({
        id: apiData.deviceId,
        name: apiData.deviceId, // Use deviceId as name, or implement a naming scheme
        temperature: apiData.temperature,
        humidity: apiData.humidity,
        waterLeak: apiData.waterLeak,
        status: deriveStatus(apiData),
        lastUpdated: apiData.timestamp ? new Date(apiData.timestamp).toLocaleTimeString() : 'N/A',
      }));
      
      setSensors(transformedSensors);
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
  }, [currentUser]); // Refetch when user changes

  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-yellow-500" />
        <p className="text-lg font-semibold">Access Denied</p>
        <p>Please log in to view sensor data.</p>
      </div>
    );
  }

  if (loading && sensors.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-destructive-foreground bg-destructive/20 p-6 rounded-lg">
        <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
        <p className="font-semibold">Failed to load sensor data</p>
        <p className="text-sm">{error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      {sensors.length === 0 && !loading ? (
         <div className="text-center py-8 text-muted-foreground">
          <p>No sensor data available at the moment.</p>
          <p className="text-sm">Ensure your Arduino devices are connected and sending data.</p>
        </div>
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
  )
}
