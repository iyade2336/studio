import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the expected schema for incoming sensor data
const SensorDataSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  waterLeak: z.boolean().optional(),
  timestamp: z.string().datetime().optional(), // Or z.date() if preferred
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the incoming data
    const validationResult = SensorDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }

    const sensorData = validationResult.data;

    // In a real application, you would:
    // 1. Authenticate the device (e.g., using a device-specific API key)
    // 2. Save the data to a database (e.g., PostgreSQL, MongoDB, Firebase Firestore)
    // 3. Push the data to connected clients via WebSockets (e.g., using Socket.io, Pusher, or a custom WebSocket server)
    
    console.log("Received sensor data:", sensorData);

    // Simulate processing and WebSocket push
    // This is where you'd integrate with your WebSocket solution
    // For example: webSocketServer.to(sensorData.deviceId).emit('newData', sensorData);

    return NextResponse.json({ message: "Data received successfully", data: sensorData }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optional: GET endpoint for testing or fetching status (not part of original request but good practice)
export async function GET() {
  return NextResponse.json({ message: "IoT Guardian Sensor API is active." });
}
