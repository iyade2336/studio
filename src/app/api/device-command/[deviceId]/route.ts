
import { NextResponse } from 'next/server';
import { z } from 'zod';

// In-memory store for commands since there is no database
const commandStore = new Map<string, any>();

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
    
    const commandToStore = {
      deviceId,
      command,
      parameters,
      timestamp: new Date().toISOString(),
      processed: false,
    };

    // Store command in our in-memory map
    commandStore.set(deviceId, commandToStore);

    console.log(`Command for device ${deviceId} set to:`, commandToStore);
    return NextResponse.json({ status: 'success', message: `Command ${command} queued for device ${deviceId}.` }, { status: 200 });

  } catch (error) {
    console.error(`Error processing command for device ${deviceId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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

  const command = commandStore.get(deviceId);

  if (command) {
    // In a real system, you might set processed=true here or have the device send an ACK
    return NextResponse.json(command, { status: 200 });
  } else {
    return NextResponse.json({ message: `No pending commands for device ${deviceId}.` }, { status: 200 }); 
  }
}
