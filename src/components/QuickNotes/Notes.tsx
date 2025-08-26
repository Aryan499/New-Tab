import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, Plus, Edit, Trash2, Video, RefreshCw, Search, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Notes = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Convert date strings back to Date objects
        const notesWithDates = parsedNotes.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(notesWithDates);
      } catch (error) {
        console.error('Error loading notes from localStorage:', error);
        // Initialize with sample data if localStorage is corrupted
        const sampleNotes = [
         
        ];
        setNotes(sampleNotes);
        localStorage.setItem('quickNotes', JSON.stringify(sampleNotes));
      }
    } else {
      // Initialize with sample data
      const sampleNotes = [
       
      ];
      setNotes(sampleNotes);
      localStorage.setItem('quickNotes', JSON.stringify(sampleNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('quickNotes', JSON.stringify(notes));
    }
  }, [notes]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new note
  const handleCreateNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title.trim() || 'Untitled',
        content: newNote.content.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      setNewNote({ title: '', content: '' });
      setIsCreating(false);
    }
  };

  // Update note
  const handleUpdateNote = () => {
    if (editingNote && (editingNote.title.trim() || editingNote.content.trim())) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { ...editingNote, updatedAt: new Date() }
          : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
    }
  };

  // Delete note
  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (editingNote && editingNote.id === id) {
      setEditingNote(null);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setNewNote({ title: '', content: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 min-h-11/12 min-w-11/12 w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Notes Manager</DialogTitle>
          <DialogDescription>
            Create, edit, search and manage your quick notes
          </DialogDescription>
        </DialogHeader>

        {/* Full Screen Create Mode */}
        {isCreating ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Note</h2>
            
            </div>
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
                className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                rows={20}
              />
              <div className="flex gap-3 justify-end">
                <Button onClick={cancelEdit} variant="outline" className="border-slate-600">
                 
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Grid Mode */
          <Card className="h-full bg-inherit border-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Quick Notes</CardTitle>
                  <CardDescription>Manage all your quick notes</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsCreating(true)} 
                  // className="bg-blue-600 hover:bg-blue-700"
                  disabled={editingNote}
                >
                  <Plus className="h-4 w-4 " />
                 
                </Button>
              </div>
              
              {/* Search Bar */}
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
              {/* Notes Grid */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    {searchTerm ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                    {filteredNotes.map((note) => (
                      <Card key={note.id} className="group bg-slate-800 border-slate-600 h-48 flex flex-col hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200">
                        {editingNote && editingNote.id === note.id ? (
                          /* Edit Mode - Full overlay */
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="bg-slate-800 border-slate-600 w-full max-w-md max-h-[80vh] overflow-y-auto">
                              <CardHeader>
                                <CardTitle className="text-white">Edit Note</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <Input
                                  type="text"
                                  value={editingNote.title}
                                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                                  className="bg-slate-700 border-slate-500 text-white focus:ring-2 focus:ring-blue-500"
                                  placeholder="Note title..."
                                />
                                <Textarea
                                  value={editingNote.content}
                                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                                  rows={6}
                                  className="bg-slate-700 border-slate-500 text-white focus:ring-2 focus:ring-blue-500 resize-none"
                                  placeholder="Note content..."
                                />
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button onClick={handleUpdateNote} size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button onClick={cancelEdit} variant="outline" size="sm">
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        ) : (
                          /* View Mode - Grid Card */
                          <CardContent className="p-3 flex flex-col h-full">
                            {/* Header with title and actions */}
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-semibold text-white truncate pr-2 flex-1">
                                {note.title}
                              </h3>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingNote({...note})}
                                  className="p-1 h-6 w-6 hover:bg-slate-700"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 h-6 w-6 hover:bg-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <p className="text-gray-300 text-xs flex-1 overflow-hidden line-clamp-4 leading-relaxed">
                              {note.content}
                            </p>
                            
                            {/* Footer with date */}
                            <div className="mt-2 pt-2 border-t border-slate-700">
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <CalendarDays className="h-2 w-2" />
                                <span className="truncate">
                                  {formatDate(note.createdAt).split(' ')[0]}
                                </span>
                                {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                                  <RefreshCw className="h-2 w-2 ml-1" />
                                )}
                              </div>
                            </div>
                            
                            {/* Action buttons - visible on hover */}
                            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNote({...note})}
                                className="text-xs h-6 px-2 flex-1 border-slate-600"
                              >
                                <Edit className="h-2 w-2 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-xs h-6 px-2 flex-1 border-slate-600 hover:bg-red-600 hover:border-red-600"
                              >
                                <Trash2 className="h-2 w-2 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
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