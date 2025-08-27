import dbConnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import Note from '@/models/quicknote';
import mongoose from 'mongoose';

// Define error types
interface MongoValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

interface MongoDuplicateError extends Error {
  code: number;
}

// Type guard for validation errors
function isValidationError(error: unknown): error is MongoValidationError {
  return error instanceof Error && error.name === 'ValidationError';
}

// Type guard for duplicate key errors
function isDuplicateError(error: unknown): error is MongoDuplicateError {
  return error instanceof Error && 'code' in error && (error as MongoDuplicateError).code === 11000;
}

// GET /api/notes - Fetch all notes
export async function GET() {
    try {
        console.log('🔄 Starting GET request for notes...');
        await dbConnect();
        console.log('✅ Database connected');

        // Debug: Check if Note model is properly loaded
        console.log('📝 Note model:', {
            isModel: Note instanceof mongoose.Model,
            modelName: Note.modelName,
            hasFind: typeof Note.find === 'function'
        });

        // Ensure the model is properly registered
        if (typeof Note.find !== 'function') {
            throw new Error('Note model is not properly initialized');
        }

        // Fetch all notes and sort them by creation date, newest first
        const notes = await Note.find({}).sort({ createdAt: -1 }).lean();
        console.log(`📊 Found ${notes.length} notes`);

        // Convert MongoDB _id to string and ensure proper date formatting
        const formattedNotes = notes.map(note => ({
            ...note,
            _id: note._id?.toString(),
            createdAt: note.createdAt?.toISOString(),
            updatedAt: note.updatedAt?.toISOString()
        }));

        return NextResponse.json({ success: true, data: formattedNotes }, { status: 200 });
    } catch (error: unknown) {
        console.error('❌ API GET Error:', error);
        
        // More detailed error logging
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notes';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Starting POST request for new note...');
        await dbConnect();

        let body: { title?: string; content?: string };
        try {
            body = await request.json() as { title?: string; content?: string };
            console.log('📥 Received body:', { title: body.title, contentLength: body.content?.length });
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

        // Sanitize and prepare note data
        const noteData = {
            title: body.title?.trim() || 'Untitled',
            content: body.content?.trim() || ''
        };

        // Validate title and content length
        if (noteData.title.length > 200) {
            return NextResponse.json(
                { success: false, error: 'Title must be 200 characters or less' },
                { status: 400 }
            );
        }

        if (noteData.content.length > 10000) {
            return NextResponse.json(
                { success: false, error: 'Content must be 10,000 characters or less' },
                { status: 400 }
            );
        }

        console.log('💾 Creating note with data:', noteData);
        
        // Debug: Check if Note model is properly loaded
        if (typeof Note.create !== 'function') {
            throw new Error('Note model create method is not available');
        }

        const newNote = await Note.create(noteData);
        console.log('✅ Note created successfully:', newNote._id);

        // Format the response to match frontend expectations
        const formattedNote = {
            ...newNote.toObject(),
            _id: newNote._id.toString(),
            createdAt: newNote.createdAt.toISOString(),
            updatedAt: newNote.updatedAt.toISOString()
        };

        return NextResponse.json({ success: true, data: formattedNote }, { status: 201 });
    } catch (error: unknown) {
        console.error('❌ API POST Error:', error);

        // Handle specific MongoDB validation errors
        if (isValidationError(error)) {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { success: false, error: `Validation Error: ${validationErrors.join(', ')}` },
                { status: 400 }
            );
        }

        // Handle MongoDB duplicate key errors
        if (isDuplicateError(error)) {
            return NextResponse.json(
                { success: false, error: 'A note with this data already exists' },
                { status: 409 }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}