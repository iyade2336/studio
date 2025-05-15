
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the expected schema for incoming sensor data
const SensorDataSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  waterLeak: z.boolean().optional(),
  timestamp: z.string().datetime().optional(), // ISO 8601 format from Arduino
});

export type InputSensorData = z.infer<typeof SensorDataSchema>;

export interface StoredSensorData extends InputSensorData {
  // lastReceived: string; // ISO string for when data was last received by server
}

// This is a server-side in-memory store. Data will be lost on server restart.
// Not suitable for production. Best for demonstration purposes.
let sensorDataStore: Record<string, StoredSensorData> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validationResult = SensorDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Store or update the data for the device
    sensorDataStore[validatedData.deviceId] = {
      ...validatedData,
      timestamp: validatedData.timestamp || new Date().toISOString(), // Use device timestamp or server's if not provided
      // lastReceived: new Date().toISOString(),
    };
    
    console.log("Received and stored sensor data:", sensorDataStore[validatedData.deviceId]);

    // TODO: Implement WebSocket push to clients if needed for true real-time updates without polling

    return NextResponse.json({ message: "Data received successfully", data: validatedData }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    if (error instanceof SyntaxError) { // Catches JSON.parse errors
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return all currently stored sensor data
    // In a real app, you might want to filter by user or add pagination
    const dataValues = Object.values(sensorDataStore);
    return NextResponse.json(dataValues, { status: 200 });
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
