
"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData as DisplaySensorData } from "./sensor-card"; 
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// This type represents the raw data structure from our local API
interface DeviceStatus {
    deviceId: string;
    temperature?: number;
    humidity?: number;
    waterLeak?: boolean;
    last_seen: string | null;
    status: 'online' | 'offline';
}

const deriveStatus = (data: DisplaySensorData): DisplaySensorData["status"] => {
  if (data.waterLeak) return "danger";
  if (data.temperature !== undefined) {
    if (data.temperature > 35) return "warning";
    if (data.temperature < 5) return "warning";
  }
  if (data.humidity !== undefined && (data.humidity > 80 || data.humidity < 20)) return "warning";
  return "ok";
};

const MAX_DEVICES_TO_DISPLAY = 10;

// Function to fetch latest readings from our local API
const fetchLatestReadings = async (): Promise<DeviceStatus[]> => {
    const response = await fetch('/api/sensor-data');
    if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
    }
    const data = await response.json();
    return data as DeviceStatus[];
};


export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<DisplaySensorData[]>([]);
  const { currentUser, addNotification, isUserApproved } = useUser();
  const { toast } = useToast();

  const { data: latestDeviceReadings, isLoading: isLoadingDevices, refetch: refetchDevices } = useQuery<DeviceStatus[]>({
    queryKey: ['latestReadings'],
    queryFn: fetchLatestReadings,
    enabled: !!currentUser?.isLoggedIn,
    refetchInterval: 30000, // Refetch every 30 seconds
  });


  useEffect(() => {
    if (!latestDeviceReadings || !currentUser) return;

    const transformedSensors = latestDeviceReadings.map(device => {
        const displayData: DisplaySensorData = {
            id: device.deviceId,
            name: device.deviceId,
            temperature: device.temperature,
            humidity: device.humidity,
            waterLeak: device.waterLeak,
            lastUpdated: device.last_seen ? format(new Date(device.last_seen), 'p') : 'N/A',
            deviceState: 'ON', // Default state, real state would need another field
            status: 'ok', // Will be derived next
            historicalData: [], // Historical data is not supported in local mode
        };
        displayData.status = deriveStatus(displayData);
        
        const hasAutoShutdownFeature = isUserApproved(currentUser.email);

        if (hasAutoShutdownFeature) {
          if (displayData.waterLeak) {
              addNotification(`CRITICAL: Water leak detected on ${displayData.id}! Auto-shutdown sequence initiated (simulated).`, 'warning');
          } else if (displayData.temperature && displayData.temperature > 40) {
              addNotification(`CRITICAL: High temperature (${displayData.temperature}°C) on ${displayData.id}! Auto-shutdown sequence initiated (simulated).`, 'warning');
          }
        }
        return displayData;
    }).slice(0, 10); // Display up to 10 devices max

    setSensors(transformedSensors);

  }, [latestDeviceReadings, currentUser, addNotification, isUserApproved]);
  
  const handleRefresh = () => {
    refetchDevices();
  };

  const handleSendCommand = async (deviceId: string, command: 'ON' | 'OFF') => {
    if (!currentUser || !isUserApproved(currentUser.email)) {
      toast({ title: "Feature Unavailable", description: "Device control is not available for your account.", variant: "destructive" });
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
      toast({ title: "Command Sent", description: `Command ${command} sent to ${deviceId}. Status: ${result.message}` });
      setSensors(prevSensors => prevSensors.map(s => s.id === deviceId ? {...s, deviceState: command} : s));
    } catch (err) {
      toast({ title: "Command Error", description: (err instanceof Error ? err.message : "Unknown error"), variant: "destructive" });
    }
  };

  const downloadCSV = () => {
    if (!currentUser || !isUserApproved(currentUser.email)) {
        toast({ title: "Feature Unavailable", description: "CSV Export not available for your account.", variant: "destructive" });
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

  const isLoading = isLoadingDevices;

  if (!currentUser || !currentUser.isLoggedIn) {
    return null; // The parent page will handle redirection
  }
  
  const skeletonCount = 4; // Default skeleton count

  if (isLoading && sensors.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(skeletonCount)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Device Overview</h3>
        <div className="flex items-center gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm" disabled={isLoading || sensors.length === 0}>
                <Download className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Download CSV
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
        </div>
      </div>
      {sensors.length === 0 && !isLoading ? (
         <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No sensor data available.</p>
          <p className="text-sm">Ensure your Arduino devices are connected and sending data with an approved account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {sensors.map((sensor) => (
            <SensorCard 
              key={sensor.id} 
              sensor={sensor} 
              onSendCommand={handleSendCommand}
            />
          ))}
          { Array(Math.max(0, MAX_DEVICES_TO_DISPLAY - sensors.length))
            .fill(null)
            .map((_,i) => <EmptyDeviceSlot key={`empty-${i}`} />)}
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
       <div className="pt-4 mt-2 border-t">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-20 w-full" />
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

    