
import { NextResponse } from 'next/server';
import { z } from 'zod';

// In-memory store for device commands. In production, use a database.
// Stores the latest command for each device.
let deviceCommands: Record<string, { command: 'ON' | 'OFF'; timestamp: string; parameters?: Record<string, any> }> = {};

const CommandSchema = z.object({
  command: z.enum(['ON', 'OFF']),
  parameters: z.record(z.any()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  const deviceId = params.deviceId;
  if (!deviceId) {
    return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validationResult = CommandSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid command format', details: validationResult.error.format() }, { status: 400 });
    }

    const { command, parameters } = validationResult.data;

    deviceCommands[deviceId] = {
      command,
      parameters,
      timestamp: new Date().toISOString(),
    };

    console.log(`Command for device ${deviceId} set to:`, deviceCommands[deviceId]);
    return NextResponse.json({ status: 'success', message: `Command ${command} queued for device ${deviceId}.`, deviceId, commandDetails: deviceCommands[deviceId] }, { status: 200 });

  } catch (error) {
    console.error(`Error processing command for device ${deviceId}:`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  const deviceId = params.deviceId;
  if (!deviceId) {
    return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
  }

  const commandDetails = deviceCommands[deviceId];

  if (commandDetails) {
    // Optional: Clear the command after it's fetched by the device to avoid re-execution,
    // or implement a more sophisticated command queue/acknowledgment system.
    // For now, we just return it. If ESP32 polls frequently, it might get the same command multiple times.
    // A robust system would involve the device acknowledging receipt.
    // delete deviceCommands[deviceId]; // Example: clear after fetch

    return NextResponse.json(commandDetails, { status: 200 });
  } else {
    return NextResponse.json({ message: `No pending commands for device ${deviceId}.` }, { status: 200 }); // 200 or 404 depending on desired behavior
  }
}
