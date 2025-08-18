
import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

const IssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  potentialCauses: z.array(z.string()),
  solutions: z.array(z.string()),
});


// GET a single issue
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, "issues", params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    
    const docRef = doc(db, "issues", params.id);
    await updateDoc(docRef, validation.data);

    return NextResponse.json({ id: params.id, ...validation.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE an issue
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, "issues", params.id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Issue deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
