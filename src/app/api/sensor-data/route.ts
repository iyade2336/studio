
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';

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

    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, "sensorData"), {
      ...validatedData,
      serverTimestamp: serverTimestamp(),
    });

    // Also update the latest status of the device in a separate collection
    const devicesRef = collection(db, 'devices');
    const q = query(devicesRef, where('deviceId', '==', validatedData.deviceId));
    const querySnapshot = await getDocs(q);

    const deviceDataToUpdate = {
        ...validatedData,
        lastSeen: serverTimestamp(),
        status: 'online', // Assume online if we're receiving data
    };

    if (querySnapshot.empty) {
        // If device doesn't exist, create it.
        // In a real app, you might want more robust device registration.
        await addDoc(devicesRef, deviceDataToUpdate);
    } else {
        // If device exists, update it.
        const deviceDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'devices', deviceDoc.id), deviceDataToUpdate);
    }

    console.log("Sensor data stored with ID: ", docRef.id);
    return NextResponse.json({ message: "Data received successfully", data: validatedData }, { status: 201 });

  } catch (error) {
    console.error("Error processing sensor data:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // This endpoint will now fetch the latest reading for each device
    // from the 'devices' collection instead of the historical log.
    const devicesRef = collection(db, 'devices');
    const q = query(devicesRef, orderBy('lastSeen', 'desc'));
    const querySnapshot = await getDocs(q);

    const allDevicesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(allDevicesData, { status: 200 });

  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
