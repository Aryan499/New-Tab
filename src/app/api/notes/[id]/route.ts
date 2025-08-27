import { NextResponse as NextResponseForId } from 'next/server';
import { default as dbConnectForId } from '@/lib/dbconnect'; // Using aliases to avoid name clashes
import { default as NoteForId } from '@/models/quicknote';       // Using aliases to avoid name clashes
import mongoose from 'mongoose';


type RouteParams = {
    params: {
        id: string;
    }
}


export async function GET(_request: Request, { params }: RouteParams) {
    const { id } =await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponseForId.json({ success: false, error: "Invalid note ID" }, { status: 400 });
    }

    try {
        await dbConnectForId();
        const note = await NoteForId.findById(id);
        if (!note) {
            return NextResponseForId.json({ success: false, error: "Note not found" }, { status: 404 });
        }
        return NextResponseForId.json({ success: true, data: note }, { status: 200 });
    } catch (error: any) {
        console.error(`API GET /api/notes/${id} Error:`, error);
        return NextResponseForId.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { id } =await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponseForId.json({ success: false, error: "Invalid note ID" }, { status: 400 });
    }

    try {
        await dbConnectForId();
        const body = await request.json();
        const updatedNote = await NoteForId.findByIdAndUpdate(id, body, {
            new: true, // Return the modified document
            runValidators: true, // Run schema validators on update
        });

        if (!updatedNote) {
            return NextResponseForId.json({ success: false, error: "Note not found" }, { status: 404 });
        }
        return NextResponseForId.json({ success: true, data: updatedNote }, { status: 200 });
    } catch (error: any) {
        console.error(`API PUT /api/notes/${id} Error:`, error);
        return NextResponseForId.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
export async function DELETE(_request: Request, { params }: RouteParams) {
    const { id } =await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponseForId.json({ success: false, error: "Invalid note ID" }, { status: 400 });
    }

    try {
        await dbConnectForId();
        const deletedNote = await NoteForId.findByIdAndDelete(id);
        if (!deletedNote) {
            return NextResponseForId.json({ success: false, error: "Note not found" }, { status: 404 });
        }
        return NextResponseForId.json({ success: true, data: {} }, { status: 200 });
    } catch (error: any) {
        console.error(`API DELETE /api/notes/${id} Error:`, error);
        return NextResponseForId.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
