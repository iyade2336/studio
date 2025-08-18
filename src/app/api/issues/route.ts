
import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// Schema for creating a new issue
const CreateIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  potentialCauses: z.array(z.string()).optional().default([]),
  solutions: z.array(z.string()).optional().default([]),
});

// GET all issues
export async function GET(request: Request) {
  try {
    const querySnapshot = await getDocs(collection(db, "issues"));
    const issues = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(issues, { status: 200 });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

    const docRef = await addDoc(collection(db, "issues"), validation.data);
    
    return NextResponse.json({ id: docRef.id, ...validation.data }, { status: 201 });

  } catch (error) {
    console.error("Error creating issue:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
