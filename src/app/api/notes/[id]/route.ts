import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import docClient from '@/lib/dbconnect';

const TableName = 'QuickNotes';

// PUT /api/notes/[id] - Update a specific note
export async function PUT(request: NextRequest, {params}: {params: Promise<{ id: string }>}) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: noteId } = await params;
    if (!noteId) {
        return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { title, content } = body;

        if (!title && !content) {
            return NextResponse.json({ success: false, error: 'Title or content is required.' }, { status: 400 });
        }

        const command = new UpdateCommand({
            TableName,
            Key: { userId, noteId },
            UpdateExpression: "set title = :t, content = :c, updatedAt = :u",
            ExpressionAttributeValues: {
                ":t": title?.trim() || 'Untitled',
                ":c": content?.trim() || '',
                ":u": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW", // Returns the updated item
        });

        const { Attributes } = await docClient.send(command);

        return NextResponse.json({ success: true, data: Attributes }, { status: 200 });

    } catch (error) {
        console.error('DynamoDB PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
    }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(request: NextRequest, {params}: {params: Promise<{ id: string }>}) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: noteId } = await params;
    if (!noteId) {
        return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    const command = new DeleteCommand({
        TableName,
        Key: { userId, noteId },
    });

    try {
        await docClient.send(command);
        return NextResponse.json({ success: true, message: 'Note deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('DynamoDB DELETE Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
    }
}