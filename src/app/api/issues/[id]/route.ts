
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

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
    const { data, error } = await supabase.from('issues').select('*').eq('id', params.id).single();

    if (error) throw error;
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
    
    const { data, error } = await supabase.from('issues').update(validation.data).eq('id', params.id).select().single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
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
    const { error } = await supabase.from('issues').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ message: "Issue deleted successfully" }, { status: 200 });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
