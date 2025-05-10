"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData } from "./sensor-card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const initialSensors: SensorData[] = [
  { id: "sensor-1", name: "Living Room Monitor", temperature: 22, humidity: 45, waterLeak: false, status: "ok", lastUpdated: new Date().toLocaleTimeString() },
  { id: "sensor-2", name: "Kitchen Monitor", temperature: 24, humidity: 60, waterLeak: false, status: "ok", lastUpdated: new Date().toLocaleTimeString() },
  { id: "sensor-3", name: "Basement Monitor", temperature: 18, humidity: 70, waterLeak: true, status: "danger", lastUpdated: new Date().toLocaleTimeString() },
  { id: "sensor-4", name: "Garage Monitor", status: "offline", lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString() },
];

export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Simulate data changes
      const updatedSensors = initialSensors.map(sensor => {
        if (sensor.status === "offline") return {...sensor, lastUpdated: new Date(Date.now() - 1000 * 60 * Math.random()*30).toLocaleTimeString() };
        
        let newTemp = sensor.temperature !== undefined ? sensor.temperature + (Math.random() - 0.5) * 2 : undefined;
        if (newTemp !== undefined) newTemp = parseFloat(newTemp.toFixed(1));
        
        let newHumidity = sensor.humidity !== undefined ? sensor.humidity + (Math.random() - 0.5) * 5 : undefined;
        if (newHumidity !== undefined) newHumidity = Math.max(0, Math.min(100, parseFloat(newHumidity.toFixed(0))));

        let newStatus = sensor.status;
        if(sensor.id === 'sensor-3' && Math.random() < 0.1) { // occasionally fix basement leak
            newStatus = 'ok';
            sensor.waterLeak = false;
        } else if(sensor.id === 'sensor-3') {
            newStatus = 'danger';
            sensor.waterLeak = true;
        } else if (newTemp !== undefined && (newTemp > 30 || newTemp < 10)) {
            newStatus = 'warning';
        } else if (newHumidity !== undefined && (newHumidity > 75 || newHumidity < 20)) {
            newStatus = 'warning';
        } else {
            newStatus = 'ok';
        }

        return {
          ...sensor,
          temperature: newTemp,
          humidity: newHumidity,
          status: newStatus as SensorData['status'],
          lastUpdated: new Date().toLocaleTimeString(),
        };
      });
      setSensors(updatedSensors);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 15000); // Refresh data every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && sensors.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
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
        <p className="text-center text-muted-foreground py-8">No sensor data available.</p>
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
