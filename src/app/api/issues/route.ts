
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

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
    const { data, error } = await supabase.from('issues').select('*');
    if (error) throw error;
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

    const { data, error } = await supabase.from('issues').insert(validation.data).select().single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("Error creating issue:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
