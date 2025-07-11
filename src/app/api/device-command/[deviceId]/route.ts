
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
      command,
      parameters,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      processed: false, // Flag to indicate if the device has acted on the command
    };

    // Use setDoc with deviceId as the document ID for easy retrieval.
    await setDoc(doc(db, "deviceCommands", deviceId), commandToStore);

    console.log(`Command for device ${deviceId} set to:`, commandToStore);
    return NextResponse.json({ status: 'success', message: `Command ${command} queued for device ${deviceId}.`, deviceId, commandDetails: commandToStore }, { status: 200 });

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

  const commandDocRef = doc(db, "deviceCommands", deviceId);
  const docSnap = await getDoc(commandDocRef);

  if (docSnap.exists()) {
    const commandDetails = docSnap.data();
    // In a robust system, you might delete the command or mark it as processed here.
    // For this implementation, we'll just return it. The device should handle not re-processing old commands.
    return NextResponse.json(commandDetails, { status: 200 });
  } else {
    return NextResponse.json({ message: `No pending commands for device ${deviceId}.` }, { status: 200 }); 
  }
}
