import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import docClient from '@/lib/dbconnect';
import { v4 as uuidv4 } from 'uuid';

const TableName = 'QuickNotes';

// GET /api/notes - Fetch all notes for the authenticated user
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        // Sort by createdAt timestamp in descending order (newest first)
        ScanIndexForward: false, 
    });

    try {
        const { Items } = await docClient.send(command);
        return NextResponse.json({ success: true, data: Items || [] }, { status: 200 });
    } catch (error) {
        console.error('DynamoDB GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
    }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
    const { userId } =await auth();
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, content } = body;

        if (!title && !content) {
            return NextResponse.json({ success: false, error: 'Title or content is required.' }, { status: 400 });
        }

        const noteId = uuidv4();
        const timestamp = new Date().toISOString();

        const newNote = {
            userId,
            noteId,
            title: title?.trim() || 'Untitled',
            content: content?.trim() || '',
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const command = new PutCommand({
            TableName,
            Item: newNote,
        });

        await docClient.send(command);

        return NextResponse.json({ success: true, data: newNote }, { status: 201 });
    } catch (error) {
        console.error('DynamoDB POST Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 });
    }
}