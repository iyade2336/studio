
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

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
      processed: false,
    };

    const { error } = await supabase
        .from('device_commands')
        .upsert({ device_id: deviceId, ...commandToStore }, { onConflict: 'device_id' });

    if (error) throw error;

    console.log(`Command for device ${deviceId} set to:`, commandToStore);
    return NextResponse.json({ status: 'success', message: `Command ${command} queued for device ${deviceId}.`, deviceId, commandDetails: commandToStore }, { status: 200 });

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

  const { data, error } = await supabase
    .from('device_commands')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching command:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    return NextResponse.json(data, { status: 200 });
  } else {
    return NextResponse.json({ message: `No pending commands for device ${deviceId}.` }, { status: 200 }); 
  }
}
