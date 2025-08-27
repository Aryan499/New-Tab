import dbConnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import Note from '@/models/quicknote';
import mongoose from 'mongoose';

// Define error types
interface MongoValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

// Type guard for validation errors
function isValidationError(error: unknown): error is MongoValidationError {
  return error instanceof Error && error.name === 'ValidationError';
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(request: NextRequest,  { params }: { params: Promise<{ id: string }>} ) {
    try {
        await dbConnect();

        const { id } =await params;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid note ID format' },
                { status: 400 }
            );
        }

        let body: { title?: string; content?: string };
        try {
            body = await request.json() as { title?: string; content?: string };
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate input - require at least title or content
        if ((!body.title || body.title.trim() === '') && 
            (!body.content || body.content.trim() === '')) {
            return NextResponse.json(
                { success: false, error: 'Title or content is required.' },
                { status: 400 }
            );
        }

        // Sanitize and prepare update data
        const updateData = {
            title: body.title?.trim() || 'Untitled',
            content: body.content?.trim() || '',
            updatedAt: new Date()
        };

        // Validate length constraints
        if (updateData.title.length > 200) {
            return NextResponse.json(
                { success: false, error: 'Title must be 200 characters or less' },
                { status: 400 }
            );
        }

        if (updateData.content.length > 10000) {
            return NextResponse.json(
                { success: false, error: 'Content must be 10,000 characters or less' },
                { status: 400 }
            );
        }

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return NextResponse.json(
                { success: false, error: 'Note not found' },
                { status: 404 }
            );
        }

        // Format the response
        const formattedNote = {
            ...updatedNote.toObject(),
            _id: updatedNote._id.toString(),
            createdAt: updatedNote.createdAt.toISOString(),
            updatedAt: updatedNote.updatedAt.toISOString()
        };

        return NextResponse.json({ success: true, data: formattedNote }, { status: 200 });
    } catch (error: unknown) {
        console.error('API PUT Error:', error);

        if (isValidationError(error)) {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { success: false, error: `Validation Error: ${validationErrors.join(', ')}` },
                { status: 400 }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const { id } =await params;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid note ID format' },
                { status: 400 }
            );
        }

        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return NextResponse.json(
                { success: false, error: 'Note not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Note deleted successfully' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('API DELETE Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}