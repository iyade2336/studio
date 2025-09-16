
import { NextResponse } from 'next/server';
import { z } from 'zod';
// Since we have no database, we will use a simple in-memory store for this example.
// This will reset every time the server restarts.
// In a real app, you would use a database.

interface DeviceData {
    deviceId: string;
    temperature?: number;
    humidity?: number;
    waterLeak?: boolean;
    last_seen: string;
    status: 'online' | 'offline';
}

const deviceStore = new Map<string, DeviceData>();

const SensorDataSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  waterLeak: z.boolean().optional(),
  timestamp: z.string().optional(), // Timestamps from devices can be unreliable
});

// Mock function to check if user subscription is active
// In a real app this would query your user database
const isSubscriptionActiveForDevice = async (deviceId: string): Promise<boolean> => {
    // For this local-only example, we'll assume any device ID containing 'active'
    // belongs to an active user. This mimics checking the user context.
    // e.g. deviceId 'esp32-active-user-01' would be approved.
    if (deviceId.includes('active')) {
        return true;
    }
    // A real implementation:
    // const user = await findUserByDevice(deviceId);
    // return user && user.subscription.planName !== 'None';
    return false;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = SensorDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }

    const { deviceId, temperature, humidity, waterLeak } = validationResult.data;
    
    // Check for active subscription before processing data
    const subscriptionActive = await isSubscriptionActiveForDevice(deviceId);
    if (!subscriptionActive) {
        return NextResponse.json({ error: "No active subscription found for this device. Data rejected." }, { status: 403 });
    }

    const deviceDataToUpdate: DeviceData = {
        deviceId,
        temperature,
        humidity,
        waterLeak,
        last_seen: new Date().toISOString(),
        status: 'online',
    };

    // Store the latest data in our in-memory map
    deviceStore.set(deviceId, deviceDataToUpdate);
    
    // Log for debugging on the server
    console.log("Sensor data stored for device: ", deviceId, deviceDataToUpdate);

    return NextResponse.json({ message: "Data received successfully", data: validationResult.data }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // This endpoint will fetch the latest reading for each device
    // from our in-memory store.
    const allDevices = Array.from(deviceStore.values());
    
    return NextResponse.json(allDevices, { status: 200 });

  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
