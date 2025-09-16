
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Mock in-memory store for issues
const issuesStore = new Map<string, any>();
// Pre-populate with some data
issuesStore.set('1', { id: '1', title: 'Sensor Offline', description: 'The sensor is not sending any data.', image_url: 'https://placehold.co/600x400.png', potential_causes: ['Power loss', 'No WiFi'], solutions: ['Check power cable', 'Reboot router'] });
issuesStore.set('2', { id: '2', title: 'Incorrect Temperature Reading', description: 'Temperature readings are unexpectedly high or low.', image_url: 'https://placehold.co/600x400.png', potential_causes: ['Sensor placement', 'Sensor malfunction'], solutions: ['Move sensor away from heat sources', 'Replace sensor'] });


// Schema for creating a new issue
const CreateIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().url("Must be a valid URL"),
  potential_causes: z.array(z.string()).optional().default([]),
  solutions: z.array(z.string()).optional().default([]),
});

// GET all issues
export async function GET(request: Request) {
  try {
    const data = Array.from(issuesStore.values());
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching issues:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


// POST a new issue
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = CreateIssueSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }
    
    const newId = (issuesStore.size + 1).toString();
    const newIssue = { id: newId, ...validation.data };
    issuesStore.set(newId, newIssue);
    
    return NextResponse.json(newIssue, { status: 201 });

  } catch (error) {
    console.error("Error creating issue:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
