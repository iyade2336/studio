
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const SensorDataSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  waterLeak: z.boolean().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
});

export type InputSensorData = z.infer<typeof SensorDataSchema>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = SensorDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid data format", details: validationResult.error.format() }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Insert into historical sensor_data table
    const { error: sensorDataError } = await supabase.from('sensor_data').insert({
        device_id: validatedData.deviceId,
        temperature: validatedData.temperature,
        humidity: validatedData.humidity,
        water_leak: validatedData.waterLeak,
        created_at: validatedData.timestamp,
    });
    if (sensorDataError) throw new Error(`Failed to insert sensor data: ${sensorDataError.message}`);

    // Update the latest status of the device in the 'devices' table
    const deviceDataToUpdate = {
        device_id: validatedData.deviceId,
        temperature: validatedData.temperature,
        humidity: validatedData.humidity,
        water_leak: validatedData.waterLeak,
        last_seen: new Date().toISOString(),
        status: 'online', // Assume online if we're receiving data
    };

    const { error: deviceUpdateError } = await supabase
      .from('devices')
      .upsert(deviceDataToUpdate, { onConflict: 'device_id' });

    if (deviceUpdateError) throw new Error(`Failed to update device status: ${deviceUpdateError.message}`);

    console.log("Sensor data stored for device: ", validatedData.deviceId);
    return NextResponse.json({ message: "Data received successfully", data: validatedData }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // This endpoint will fetch the latest reading for each device
    // from the 'devices' collection.
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('last_seen', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
