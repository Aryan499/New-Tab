import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";
import { NoteType } from "@/lib/types";

type NoteFormProps = {
  noteToEdit?: NoteType | null;
  onSave: (note: { title: string; content: string }) => void;
  onCancel: () => void;
};

const NoteForm = ({ noteToEdit, onSave, onCancel }: NoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setTitle(noteToEdit?.title || '');
    setContent(noteToEdit?.content || '');
  }, [noteToEdit]);
  
  const isFormEmpty = !title.trim() && !content.trim();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormEmpty) {
      onSave({ title, content });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6">
        {noteToEdit ? 'Edit Note' : 'Create New Note'}
      </h2>
      <div className="flex-1 flex flex-col gap-4">
        <label htmlFor="note-title">Title</label>
        <Input
          type="text"
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          autoFocus
          id='note-title'
        />
        <label htmlFor="note-content">Description</label>
        <textarea
          id="note-content"
          placeholder="Describe your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 resize-none p-4 bg-slate-800 border border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 rounded-md"
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" onClick={onCancel} variant="outline" className="border-slate-600">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" disabled={isFormEmpty}>
            <Save className="h-4 w-4 mr-2" /> {noteToEdit ? 'Update Note' : 'Save Note'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NoteForm;