"use client";
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Plus, Edit, Trash2, RefreshCw, Search, Save, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define a type for a note that matches the MongoDB schema
type NoteType = {
  _id: string; // MongoDB uses _id as a string
  title: string;
  content: string;
  createdAt: string; // Dates will be strings from the API
  updatedAt: string;
};

/**
 * A helper function to handle API requests, ensuring the response is valid JSON.
 * @param url The API endpoint to fetch from.
 * @param options The options for the fetch request (method, headers, body, etc.).
 * @returns The JSON data from the API response.
 * @throws An error if the response is not successful or not valid JSON.
 */
async function apiFetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
        // If the content type is JSON, parse it for a detailed error message.
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.statusText}`);
        }
        // Otherwise, return the plain text response.
        const errorText = await response.text();
        console.error("API Error Response (Not JSON):", errorText);
        throw new Error(`Server responded with an error: ${response.statusText}`);
    }
    
    // Handle cases where the response is OK but there's no content (e.g., DELETE).
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
        return null; 
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error || 'An unknown API error occurred');
    }
    return result.data;
}


const Notes = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the delete confirmation
  const [noteToDelete, setNoteToDelete] = useState<NoteType | null>(null);

  // Fetch notes from the API on component mount or when the dialog opens
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiFetch('/api/notes');
        setNotes(data || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notes';
        setError(errorMessage);
        console.error('Failed to fetch notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if(open) {
        fetchNotes();
    }
  }, [open]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create a new note via API
  const handleCreateNote = async () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      try {
        setError(null);
        const newNoteData = await apiFetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNote),
        });
        setNotes([newNoteData, ...notes]);
        setNewNote({ title: '', content: '' });
        setIsCreating(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
        console.error("Create note error:", errorMessage);
        setError(`Create Error: ${errorMessage}`);
      }
    }
  };

  // Update a note via API
  const handleUpdateNote = async () => {
    if (!editingNote) return;
    try {
      setError(null);
      const updatedNote = await apiFetch(`/api/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingNote.title, content: editingNote.content }),
      });
      setNotes(notes.map(note => note._id === editingNote._id ? updatedNote : note));
      setEditingNote(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      console.error("Update note error:", errorMessage);
      setError(`Update Error: ${errorMessage}`);
    }
  };

  // Delete a note via API
  const handleDeleteNote = async (id: string) => {
    try {
        setError(null);
        await apiFetch(`/api/notes/${id}`, {
            method: 'DELETE',
        });
        setNotes(notes.filter(note => note._id !== id));
        setNoteToDelete(null);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
        console.error("Delete note error:", errorMessage);
        setError(`Delete Error: ${errorMessage}`);
    }
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setNoteToDelete(null);
    setNewNote({ title: '', content: '' });
  };

  // Handle escape key to close dialogs
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingNote || noteToDelete || isCreating) {
          cancelEdit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingNote, noteToDelete, isCreating]);

  // Renders the main content area (loading, error, notes grid)
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64 text-white">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Loading notes...
        </div>
      );
    }
    if (filteredNotes.length === 0 && !error) {
      return (
        <div className="text-center py-12 text-gray-400">
          {searchTerm ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
        {filteredNotes.map((note) => (
          <Card key={note._id} className="group bg-slate-800 border-slate-600 h-48 flex flex-col hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200">
            <CardContent className="p-3 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white truncate pr-2 flex-1" title={note.title}>{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingNote({...note})} 
                      className="p-1 h-6 w-6 hover:bg-slate-700"
                      title="Edit note"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setNoteToDelete(note)} 
                      className="p-1 h-6 w-6 hover:bg-red-600"
                      title="Delete note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 text-xs flex-1 overflow-hidden line-clamp-4 leading-relaxed" title={note.content}>{note.content}</p>
                <div className="mt-auto pt-2 border-t border-slate-700">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarDays className="h-2 w-2" />
                    <span className="truncate">{formatDate(note.createdAt).split(' ')[0]}</span>
                    {note.updatedAt !== note.createdAt && (
                        <span title={`Updated: ${formatDate(note.updatedAt)}`}>
                            <RefreshCw className="h-2 w-2 ml-1" />
                        </span>
                    )}
                  </div>
                </div>
              </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 min-h-5/6 min-w-11/12">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Notes Manager</DialogTitle>
          <DialogDescription>Create, edit, search and manage your quick notes</DialogDescription>
        </DialogHeader>
        
        {/* Create Note View */}
        {isCreating && (
          <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Note</h2>
            <div className="flex-1 flex flex-col gap-4">
              <Input 
                type="text" 
                placeholder="Enter note title..." 
                value={newNote.title} 
                onChange={(e) => setNewNote({...newNote, title: e.target.value})} 
                className="text-xl font-semibold bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" 
                autoFocus 
              />
              <Textarea 
                placeholder="Write your note here..." 
                value={newNote.content} 
                onChange={(e) => setNewNote({...newNote, content: e.target.value})} 
                className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none min-h-[400px]" 
              />
              <div className="flex gap-3 justify-end">
                <Button onClick={cancelEdit} variant="outline" className="border-slate-600">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={!newNote.title.trim() && !newNote.content.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Note View */}
        {editingNote && (
          <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Note</h2>
            <div className="flex-1 flex flex-col gap-4">
              <Input 
                type="text" 
                value={editingNote.title} 
                onChange={(e) => setEditingNote({...editingNote, title: e.target.value})} 
                className="text-xl font-semibold bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter note title..." 
                autoFocus
              />
              <Textarea 
                value={editingNote.content} 
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})} 
                className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none min-h-[400px]" 
                placeholder="Write your note here..." 
              />
              <div className="flex gap-3 justify-end">
                <Button onClick={cancelEdit} variant="outline" className="border-slate-600">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateNote} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!editingNote.title.trim() && !editingNote.content.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation View */}
        {noteToDelete && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Delete Note</h2>
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete this note? This action cannot be undone.
                </p>
              </div>
              
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-white mb-2" title={noteToDelete.title}>
                  {noteToDelete.title || 'Untitled'}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3" title={noteToDelete.content}>
                  {noteToDelete.content || 'No content'}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>Created: {formatDate(noteToDelete.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={cancelEdit} variant="outline" className="border-slate-600">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteNote(noteToDelete._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Notes List View */}
        {!isCreating && !editingNote && !noteToDelete && (
          <Card className="h-full bg-inherit border-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Quick Notes</CardTitle>
                  <CardDescription>Manage all your quick notes</CardDescription>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Search notes..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
               {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md mb-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto p-1 h-auto">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">{renderContent()}</div>
            </CardContent>
            <CardFooter className="flex-shrink-0 justify-between text-sm text-gray-400">
              <span>Total notes: {notes.length}</span>
              {searchTerm && <span>Showing: {filteredNotes.length}</span>}
            </CardFooter>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Notes;