
"use client";
import { useState, useEffect } from "react";
import { SensorCard, type SensorData as DisplaySensorData } from "./sensor-card"; 
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreQueryData } from "@tanstack-query-firebase/react";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

// This type represents the raw data structure from Firestore
interface FirestoreSensorReading {
    deviceId: string;
    temperature?: number;
    humidity?: number;
    waterLeak?: boolean;
    serverTimestamp: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

const deriveStatus = (data: DisplaySensorData, currentUser: ReturnType<typeof useUser>['currentUser']): DisplaySensorData["status"] => {
  if (data.waterLeak) return "danger";
  if (data.temperature !== undefined) {
    if (data.temperature > 35) return "warning";
    if (data.temperature < 5) return "warning";
  }
  if (data.humidity !== undefined && (data.humidity > 80 || data.humidity < 20)) return "warning";
  return "ok";
};

const MAX_DEVICES_TO_DISPLAY = 10;
const MAX_HISTORICAL_READINGS = 20;

export function RealtimeDataGrid() {
  const [sensors, setSensors] = useState<DisplaySensorData[]>([]);
  const { currentUser, addNotification } = useUser();
  const { toast } = useToast();

  const devicesRef = collection(db, 'devices');
  const devicesQuery = query(devicesRef, orderBy('lastSeen', 'desc'), limit(MAX_DEVICES_TO_DISPLAY));

  const { data: latestDeviceReadings, isLoading: isLoadingDevices, refetch } = useFirestoreQueryData(
    ['latestReadings'],
    devicesQuery,
    { subscribe: true },
    {
      enabled: !!currentUser?.isLoggedIn,
    }
  );

  const historicalDataRef = collection(db, 'sensorData');
  const historicalQuery = query(historicalDataRef, orderBy('serverTimestamp', 'desc'), limit(MAX_HISTORICAL_READINGS * MAX_DEVICES_TO_DISPLAY));

  const { data: historicalReadings, isLoading: isLoadingHistorical } = useFirestoreQueryData<FirestoreSensorReading>(
    ['historicalReadings'],
    historicalQuery,
    { subscribe: true },
    {
      enabled: !!currentUser?.isLoggedIn,
    }
  );


  useEffect(() => {
    if (!latestDeviceReadings || !currentUser) return;

    const transformedSensors = latestDeviceReadings.map(device => {
        const displayData: DisplaySensorData = {
            id: device.deviceId,
            name: device.deviceId,
            temperature: device.temperature,
            humidity: device.humidity,
            waterLeak: device.waterLeak,
            lastUpdated: device.lastSeen ? format(new Date(device.lastSeen.seconds * 1000), 'p') : 'N/A',
            deviceState: 'ON', // Default state, real state would need another field in Firestore
            status: 'ok', // Will be derived next
            historicalData: historicalReadings
              ?.filter(h => h.deviceId === device.deviceId)
              .map(h => ({ 
                  time: h.serverTimestamp ? format(new Date(h.serverTimestamp.seconds * 1000), 'HH:mm') : 'N/A', 
                  temperature: h.temperature 
                }))
              .reverse() // Correct order for charting
              .slice(-10), // Limit to last 10 for chart clarity
        };
        displayData.status = deriveStatus(displayData, currentUser);
        
        // Auto-shutdown warning logic
        if (currentUser.subscription.hasAutoShutdownFeature) {
          if (displayData.waterLeak) {
              addNotification(`CRITICAL: Water leak detected on ${displayData.id}! Auto-shutdown sequence initiated (simulated).`, 'warning');
          } else if (displayData.temperature && displayData.temperature > 40) {
              addNotification(`CRITICAL: High temperature (${displayData.temperature}°C) on ${displayData.id}! Auto-shutdown sequence initiated (simulated).`, 'warning');
          }
        }
        return displayData;
    }).slice(0, currentUser.subscription.maxDevices);

    setSensors(transformedSensors);

  }, [latestDeviceReadings, historicalReadings, currentUser]);
  

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
      setSensors(prevSensors => prevSensors.map(s => s.id === deviceId ? {...s, deviceState: command} : s));
    } catch (err) {
      toast({ title: "Command Error", description: (err instanceof Error ? err.message : "Unknown error"), variant: "destructive" });
    }
  };

  const downloadCSV = () => {
    if (!currentUser?.subscription.canExportCsv) {
        toast({ title: "Feature Unavailable", description: "CSV Export not available on your current plan.", variant: "destructive" });
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

  const isLoading = isLoadingDevices || isLoadingHistorical;

  if (!currentUser || !currentUser.isLoggedIn) {
    return null; // The parent page will handle redirection
  }

  if (isLoading && sensors.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(Math.min(currentUser.subscription.maxDevices, 4))].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={downloadCSV} variant="outline" disabled={isLoading || sensors.length === 0 || !currentUser.subscription.canExportCsv} title={!currentUser.subscription.canExportCsv ? "CSV Export not available on your plan" : ""}>
            <Download className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Download CSV
        </Button>
        <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      {sensors.length === 0 && !isLoading ? (
         <div className="text-center py-8 text-muted-foreground">
          <p>No sensor data available for your allowed devices ({currentUser.subscription.maxDevices}).</p>
          <p className="text-sm">Ensure your Arduino devices are connected and sending data.</p>
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
