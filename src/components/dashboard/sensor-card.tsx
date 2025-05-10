"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Thermometer, Droplets, ShieldAlert, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SensorData {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  waterLeak?: boolean;
  status: "ok" | "warning" | "danger" | "offline";
  lastUpdated?: string;
}

interface SensorCardProps {
  sensor: SensorData;
}

export function SensorCard({ sensor }: SensorCardProps) {
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

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", getBorderColor(), "border-l-4")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{sensor.name}</CardTitle>
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
      <CardContent>
        {sensor.status === "offline" ? (
          <p className="text-muted-foreground text-center py-4">Device is offline</p>
        ) : (
          <div className="space-y-3">
            {sensor.temperature !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Thermometer className="h-5 w-5 mr-2 text-accent" />
                  <span>Temperature</span>
                </div>
                <span className="font-medium">{sensor.temperature}°C</span>
              </div>
            )}
            {sensor.humidity !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Droplets className="h-5 w-5 mr-2 text-accent" />
                  <span>Humidity</span>
                </div>
                <span className="font-medium">{sensor.humidity}%</span>
              </div>
            )}
            {sensor.waterLeak !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <ShieldAlert className="h-5 w-5 mr-2 text-accent" />
                  <span>Water Leak</span>
                </div>
                <span className={cn("font-medium", sensor.waterLeak ? "text-red-500" : "text-green-500")}>
                  {sensor.waterLeak ? "Detected" : "None"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
