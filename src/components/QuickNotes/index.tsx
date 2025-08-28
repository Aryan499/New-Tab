"use client";
import React, { useState } from 'react';
// Added DialogHeader, Title, and Description for accessibility
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from '@/hooks/useNotes';
import { NoteType } from '@/types/NoteType.types';
import NoteList from '@/components/QuickNotes/NoteList'; 
import NotesHeader from '@/components/QuickNotes/NotesHeader'; 
import NoteForm from '@/components/QuickNotes/NoteForm';       
import DeleteConfirmation from '@/components/QuickNotes/DeleteConfirmation';

// Enum to manage which UI view is currently active
enum View {
  List,
  Create,
  Edit,
  Delete,
}

const Notes = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
  // The useNotes hook encapsulates all data fetching and state management logic
  const { notes, isLoading, error, setError, createNote, updateNote, deleteNote } = useNotes(open);
  
  // State for controlling the UI view and the note being acted upon
  const [currentView, setCurrentView] = useState<View>(View.List);
  const [activeNote, setActiveNote] = useState<NoteType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  /** Resets the view to the main list and clears any active note or error. */
  const resetView = () => {
    setCurrentView(View.List);
    setActiveNote(null);
    setError(null);
  };
  
  /** Handles saving a new note or updating an existing one. */
  const handleSaveNote = async (noteData: { title: string; content: string }) => {
    try {
      if (currentView === View.Edit && activeNote) {
        await updateNote(activeNote.noteId, noteData);
      } else {
        await createNote(noteData);
      }
      resetView();
    } catch (err: unknown) {
      setError(err instanceof Error ? `Save failed: ${err.message}` : 'An unknown error occurred');
    }
  };

  /** Handles the final confirmation for deleting a note. */
  const handleDeleteConfirm = async () => {
    if (activeNote) {
      try {
        await deleteNote(activeNote.noteId);
        resetView();
      } catch (err: unknown) {
        setError(err instanceof Error ? `Delete failed: ${err.message}` : 'An unknown error occurred');
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  /** Renders the appropriate component based on the current view state. */
  const renderCurrentView = () => {
    switch(currentView) {
      case View.Create:
      case View.Edit:
        return <NoteForm onSave={handleSaveNote} onCancel={resetView} noteToEdit={activeNote} />;
      
      case View.Delete:
        return activeNote && <DeleteConfirmation note={activeNote} onConfirm={handleDeleteConfirm} onCancel={resetView} />;
      
      case View.List:
      default:
        return (
          <Card className="h-full bg-inherit border-0 flex flex-col">
            <NotesHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddNew={() => setCurrentView(View.Create)}
            />
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <NoteList
                  notes={notes}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                  onEdit={(note) => { setActiveNote(note); setCurrentView(View.Edit); }}
                  onDelete={(note) => { setActiveNote(note); setCurrentView(View.Delete); }}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-shrink-0 justify-between text-sm text-gray-400">
              <span>Total notes: {notes.length}</span>
              {searchTerm && <span>Showing: {filteredNotes.length}</span>}
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 min-h-5/6 min-w-11/12">
        {/* A visually hidden header is crucial for screen reader accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Notes Manager</DialogTitle>
          <DialogDescription>
            Create, edit, search and manage your quick notes.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 bg-red-900/80 border border-red-700 text-red-300 px-4 py-2 rounded-md flex items-center gap-3 z-10 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto p-1 h-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {renderCurrentView()}
      </DialogContent>
    </Dialog>
  );
};

export default Notes;