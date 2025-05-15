
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Thermometer, Droplets, ShieldAlert, Wifi, WifiOff, AlertTriangle, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context"; // Import useUser

export interface SensorData {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  waterLeak?: boolean;
  status: "ok" | "warning" | "danger" | "offline";
  lastUpdated?: string;
  deviceState?: 'ON' | 'OFF'; // For device control
}

interface SensorCardProps {
  sensor: SensorData;
  onSendCommand?: (deviceId: string, command: 'ON' | 'OFF') => void;
}

export function SensorCard({ sensor, onSendCommand }: SensorCardProps) {
  const { currentUser } = useUser(); // Get currentUser from context

  const getStatusColor = () => {
    switch (sensor.status) {
      case "ok":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "danger":
        return "text-red-500";
      case "offline":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  const getBorderColor = () => {
    switch (sensor.status) {
      case "ok":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "danger":
        return "border-red-500";
      case "offline":
        return "border-muted";
      default:
        return "border-border";
    }
  }

  const canControl = currentUser?.subscription.canControlDevice && onSendCommand;

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col", getBorderColor(), "border-l-4")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold truncate" title={sensor.name}>{sensor.name}</CardTitle>
          {sensor.status === "offline" ? (
            <WifiOff className={cn("h-5 w-5", getStatusColor())} />
          ) : sensor.status === "danger" || sensor.status === "warning" ? (
            <AlertTriangle className={cn("h-5 w-5", getStatusColor())} />
          ) : (
            <Wifi className={cn("h-5 w-5", getStatusColor())} />
          )}
        </div>
        {sensor.lastUpdated && <CardDescription className="text-xs">Last updated: {sensor.lastUpdated}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        {sensor.status === "offline" ? (
          <p className="text-muted-foreground text-center py-4">Device is offline</p>
        ) : (
          <div className="space-y-3">
            {sensor.temperature !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Thermometer className="h-5 w-5 mr-2 text-accent shrink-0" />
                  <span>Temperature</span>
                </div>
                <span className="font-medium">{sensor.temperature}°C</span>
              </div>
            )}
            {sensor.humidity !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Droplets className="h-5 w-5 mr-2 text-accent shrink-0" />
                  <span>Humidity</span>
                </div>
                <span className="font-medium">{sensor.humidity}%</span>
              </div>
            )}
            {sensor.waterLeak !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <ShieldAlert className="h-5 w-5 mr-2 text-accent shrink-0" />
                  <span>Water Leak</span>
                </div>
                <span className={cn("font-medium", sensor.waterLeak ? "text-red-500" : "text-green-500")}>
                  {sensor.waterLeak ? "Detected" : "None"}
                </span>
              </div>
            )}
            {currentUser?.subscription.hasAutoShutdownFeature && (sensor.waterLeak || (sensor.temperature && sensor.temperature > 35)) && (
                 <div className="mt-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 shrink-0"/>
                    <span>Critical! Auto-shutdown active or imminent.</span>
                </div>
            )}
          </div>
        )}
      </CardContent>
      {canControl && sensor.status !== 'offline' && (
        <CardFooter className="pt-4 border-t">
          <div className="flex w-full justify-end space-x-2">
            <Button 
              size="sm" 
              variant={sensor.deviceState === 'ON' ? "outline" : "default"} 
              onClick={() => onSendCommand(sensor.id, 'ON')}
              disabled={sensor.deviceState === 'ON'}
              className="flex-1"
            >
              <Power className="mr-1 h-4 w-4" /> Turn On
            </Button>
            <Button 
              size="sm" 
              variant={sensor.deviceState === 'OFF' ? "destructive" : "outline"} 
              onClick={() => onSendCommand(sensor.id, 'OFF')}
              disabled={sensor.deviceState === 'OFF'}
              className="flex-1"
            >
              <PowerOff className="mr-1 h-4 w-4" /> Turn Off
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
