
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Mock in-memory store for issues
const issuesStore = new Map<string, any>();
// Pre-populate with some data
issuesStore.set('1', { id: '1', title: 'Sensor Offline', description: 'The sensor is not sending any data.', image_url: 'https://placehold.co/600x400.png', potential_causes: ['Power loss', 'No WiFi'], solutions: ['Check power cable', 'Reboot router'] });
issuesStore.set('2', { id: '2', title: 'Incorrect Temperature Reading', description: 'Temperature readings are unexpectedly high or low.', image_url: 'https://placehold.co/600x400.png', potential_causes: ['Sensor placement', 'Sensor malfunction'], solutions: ['Move sensor away from heat sources', 'Replace sensor'] });

const IssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image_url: z.string().url(),
  potential_causes: z.array(z.string()),
  solutions: z.array(z.string()),
});

// GET a single issue
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = issuesStore.get(params.id);
    if (data) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// UPDATE an issue
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = IssueSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }
    
    if (!issuesStore.has(params.id)) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const updatedIssue = { id: params.id, ...validation.data };
    issuesStore.set(params.id, updatedIssue);

    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE an issue
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = issuesStore.delete(params.id);
    if (deleted) {
        return NextResponse.json({ message: "Issue deleted successfully" }, { status: 200 });
    } else {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
