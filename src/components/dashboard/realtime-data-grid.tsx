
"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData as DisplaySensorData } from "./sensor-card"; 
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredSensorData } from "@/app/api/sensor-data/route"; 
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

const deriveStatus = (data: StoredSensorData, currentUser: ReturnType<typeof useUser>['currentUser']): DisplaySensorData["status"] => {
  if (data.waterLeak) {
    if (currentUser?.subscription.hasAutoShutdownFeature) {
      // Potentially trigger a specific notification about auto-shutdown logic
    }
    return "danger";
  }
  if (data.temperature !== undefined) {
    if (data.temperature > 35 ) { // High temp warning
        if (currentUser?.subscription.hasAutoShutdownFeature) {
            // Potentially trigger a specific notification about auto-shutdown logic
        }
        return "warning";
    }
    if (data.temperature < 5) { // Low temp warning
        return "warning";
    }
  }
  if (data.humidity !== undefined && (data.humidity > 80 || data.humidity < 20)) return "warning";
  return "ok";
};

const MAX_DEVICES_TO_DISPLAY = 10; // To prevent overwhelming the UI if many devices send data

export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<DisplaySensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, addNotification } = useUser();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setSensors([]);
      setLoading(false);
      setError(null);
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
      
      const userMaxDevices = currentUser.subscription.maxDevices;
      const devicesToProcess = data.slice(0, userMaxDevices); // Respect user's device limit for display

      const transformedSensors = devicesToProcess.map(apiData => {
        const status = deriveStatus(apiData, currentUser);
        // Auto-shutdown warning logic
        if (currentUser.subscription.hasAutoShutdownFeature) {
            if (apiData.waterLeak) {
                addNotification(`CRITICAL: Water leak detected on ${apiData.deviceId}! Auto-shutdown sequence initiated (simulated).`, 'warning');
            } else if (apiData.temperature && apiData.temperature > 40) { // Example critical temp for shutdown
                addNotification(`CRITICAL: High temperature (${apiData.temperature}°C) on ${apiData.deviceId}! Auto-shutdown sequence initiated (simulated).`, 'warning');
            }
        }

        return {
          id: apiData.deviceId,
          name: apiData.deviceId, 
          temperature: apiData.temperature,
          humidity: apiData.humidity,
          waterLeak: apiData.waterLeak,
          status: status,
          lastUpdated: apiData.timestamp ? new Date(apiData.timestamp).toLocaleTimeString() : 'N/A',
          // Initial device command state (local, will be updated by API in real implementation)
          deviceState: 'ON', // Assume ON by default or fetch from a persistent state
        };
      }).slice(0, MAX_DEVICES_TO_DISPLAY); // Further limit for UI sanity
      
      setSensors(transformedSensors);
    } catch (e) {
      console.error("Error fetching sensor data:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while fetching data.");
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [currentUser]); 

  const handleSendCommand = async (deviceId: string, command: 'ON' | 'OFF') => {
    if (!currentUser?.subscription.canControlDevice) {
      toast({ title: "Feature Unavailable", description: "Device control is not available on your current plan.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/device-command/${deviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) throw new Error('Failed to send command');
      const result = await response.json();
      toast({ title: "Command Sent", description: `Command ${command} sent to ${deviceId}. Status: ${result.status}` });
      // Optimistically update UI or re-fetch device state
      setSensors(prevSensors => prevSensors.map(s => s.id === deviceId ? {...s, deviceState: command} : s));
    } catch (err) {
      toast({ title: "Command Error", description: (err instanceof Error ? err.message : "Unknown error"), variant: "destructive" });
    }
  };

  const downloadCSV = () => {
    if (!currentUser?.subscription.canExportCsv) {
        toast({ title: "Feature Unavailable", description: "CSV Export is not available on your current plan.", variant: "destructive" });
        return;
    }
    if (sensors.length === 0) {
        toast({ title: "No Data", description: "No sensor data to export.", variant: "default" });
        return;
    }

    const headers = ["Device ID", "Name", "Temperature (C)", "Humidity (%)", "Water Leak", "Status", "Last Updated"];
    const csvRows = [
        headers.join(','),
        ...sensors.map(s => [
            s.id,
            s.name,
            s.temperature ?? 'N/A',
            s.humidity ?? 'N/A',
            s.waterLeak ? 'Detected' : 'None',
            s.status,
            s.lastUpdated ?? 'N/A'
        ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `iot_guardian_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    toast({ title: "CSV Exported", description: "Current sensor data has been downloaded."});
  };


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
        {[...Array(Math.min(currentUser.subscription.maxDevices, 4))].map((_, i) => (
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
      <div className="flex justify-between items-center mb-4">
        <Button onClick={downloadCSV} variant="outline" disabled={loading || sensors.length === 0 || !currentUser.subscription.canExportCsv} title={!currentUser.subscription.canExportCsv ? "CSV Export not available on your plan" : ""}>
            <Download className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Download CSV
        </Button>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      {sensors.length === 0 && !loading ? (
         <div className="text-center py-8 text-muted-foreground">
          <p>No sensor data available for your allowed devices ({currentUser.subscription.maxDevices}).</p>
          <p className="text-sm">Ensure your Arduino devices are connected, sending data with recognized Device IDs, and within your subscription limit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {sensors.map((sensor) => (
            <SensorCard 
              key={sensor.id} 
              sensor={sensor} 
              onSendCommand={currentUser.subscription.canControlDevice ? handleSendCommand : undefined}
            />
          ))}
          {/* Placeholder cards if user has more allowed devices than currently reporting */}
          { Array(Math.max(0, currentUser.subscription.maxDevices - sensors.length)).fill(null).slice(0, MAX_DEVICES_TO_DISPLAY - sensors.length).map((_,i) => <EmptyDeviceSlot key={`empty-${i}`} />)}
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
      <div className="flex justify-end mt-4 space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

function EmptyDeviceSlot() {
    return (
      <div className="p-4 border border-dashed rounded-lg shadow-sm bg-card/50 flex flex-col items-center justify-center min-h-[200px]">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">Device slot available</p>
        <p className="text-xs text-muted-foreground text-center">Connect a new device</p>
      </div>
    )
  }
