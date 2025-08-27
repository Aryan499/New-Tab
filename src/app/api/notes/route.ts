import dbConnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import Note from '@/models/quicknote';


// GET /api/notes - Fetch all notes
export async function GET() {
    try {
        console.log('🔄 Starting GET request for notes...');
        await dbConnect();
        console.log('✅ Database connected');

        // Debug: Check if Note model is properly loaded
        

        // Ensure the model is properly registered
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
    } catch (error: any) {
        console.error('❌ API GET Error:', error);
        
        // More detailed error logging
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch notes' },
            { status: 500 }
        );
    }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Starting POST request for new note...');
        await dbConnect();

        let body;
        try {
            body = await request.json();
            console.log('📥 Received body:', { title: body.title, contentLength: body.content?.length });
        } catch (parseError) {
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
    } catch (error: any) {
        console.error('❌ API POST Error:', error);

        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { success: false, error: `Validation Error: ${validationErrors.join(', ')}` },
                { status: 400 }
            );
        }

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'A note with this data already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create note' },
            { status: 500 }
        );
    }
}