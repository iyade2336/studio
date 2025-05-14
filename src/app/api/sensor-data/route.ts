import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for incoming data via POST
const IncomingSensorDataSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  waterLeak: z.boolean().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(), // Expect ISO 8601 string
});

// Internal state for each device
interface InternalDeviceState {
  deviceId: string;
  name: string;
  temperature?: number;
  humidity?: number;
  waterLeak?: boolean;
  lastTimestamp: string; // ISO 8601 string
}

// Response format for GET, matches SensorData in SensorCard
export interface ApiSensorResponseItem {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  waterLeak?: boolean;
  status: "ok" | "warning" | "danger" | "offline";
  lastUpdated: string; // Formatted time string, e.g., "10:30:00 AM"
}

// In-memory store for device states
const deviceStates = new Map<string, InternalDeviceState>();

// Static mapping for device names (can be expanded or moved to a config)
const deviceNameMapping: Record<string, string> = {
  "sensor-1": "Living Room Monitor",
  "sensor-2": "Kitchen Monitor",
  "sensor-3": "Basement Monitor",
  "sensor-4": "Garage Monitor",
  "esp8266-living-room-01": "Arduino Living Room Sensor"
};

// Seed initial data for demo purposes
function seedInitialData() {
  if (deviceStates.size === 0) {
    const initialDeviceStatesData: Partial<InternalDeviceState>[] = [
      { deviceId: "sensor-1", temperature: 22, humidity: 45, waterLeak: false, lastTimestamp: new Date().toISOString() },
      { deviceId: "sensor-2", temperature: 24, humidity: 60, waterLeak: false, lastTimestamp: new Date().toISOString() },
      { deviceId: "sensor-3", temperature: 18, humidity: 70, waterLeak: true, lastTimestamp: new Date().toISOString() },
      { deviceId: "sensor-4", lastTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }, // Offline example
    ];
    initialDeviceStatesData.forEach(state => {
      if (state.deviceId) {
        deviceStates.set(state.deviceId, {
          deviceId: state.deviceId,
          name: deviceNameMapping[state.deviceId] || state.deviceId,
          temperature: state.temperature,
          humidity: state.humidity,
          waterLeak: state.waterLeak,
          lastTimestamp: state.lastTimestamp || new Date().toISOString(),
        });
      }
    });
  }
}
seedInitialData(); // Call once when the module loads


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = IncomingSensorDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }

    const { deviceId, temperature, humidity, waterLeak, timestamp } = validationResult.data;
    const lastTimestamp = timestamp || new Date().toISOString();
    const name = deviceNameMapping[deviceId] || deviceId;

    const currentState = deviceStates.get(deviceId) || {} as Partial<InternalDeviceState>;

    deviceStates.set(deviceId, {
      ...currentState,
      deviceId,
      name,
      temperature: temperature !== undefined ? temperature : currentState.temperature,
      humidity: humidity !== undefined ? humidity : currentState.humidity,
      waterLeak: waterLeak !== undefined ? waterLeak : currentState.waterLeak,
      lastTimestamp,
    });

    console.log("Updated sensor data for device:", deviceId, deviceStates.get(deviceId));
    // Optionally, you could return the updated state of the specific device
    return NextResponse.json({ message: "Data received successfully", data: deviceStates.get(deviceId) }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const responseItems: ApiSensorResponseItem[] = [];
  const now = Date.now();

  deviceStates.forEach((state) => {
    let status: ApiSensorResponseItem["status"];
    const lastUpdateMillis = new Date(state.lastTimestamp).getTime();

    if (now - lastUpdateMillis > 15 * 60 * 1000) { // 15 minutes threshold for offline
      status = "offline";
    } else if (state.waterLeak === true) {
      status = "danger";
    } else if (
      (state.temperature !== undefined && (state.temperature > 30 || state.temperature < 10)) ||
      (state.humidity !== undefined && (state.humidity > 75 || state.humidity < 20))
    ) {
      status = "warning";
    } else {
      status = "ok";
    }
    
    // If offline, sensor values might not be relevant or could be shown as last known
    const temperature = status === 'offline' ? undefined : state.temperature;
    const humidity = status === 'offline' ? undefined : state.humidity;
    const waterLeak = status === 'offline' ? undefined : state.waterLeak;


    responseItems.push({
      id: state.deviceId,
      name: state.name,
      temperature: temperature,
      humidity: humidity,
      waterLeak: waterLeak,
      status: status,
      lastUpdated: new Date(state.lastTimestamp).toLocaleTimeString(),
    });
  });

  return NextResponse.json(responseItems);
}
