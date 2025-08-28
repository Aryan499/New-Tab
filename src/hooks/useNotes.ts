"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { NoteType } from '@/types/NoteType.types';

export const useNotes = (isOpen: boolean) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch('/api/notes');
      setNotes(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  const createNote = async (newNote: { title: string; content: string }) => {
    const newNoteData = await apiFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    });
    setNotes(prevNotes => [newNoteData, ...prevNotes]);
  };

  const updateNote = async (id: string, updatedData: { title: string; content: string }) => {
    const updatedNote = await apiFetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    setNotes(prevNotes => prevNotes.map(note => (note.noteId === id ? updatedNote : note)));
  };

  const deleteNote = async (id: string) => {
    await apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(prevNotes => prevNotes.filter(note => note.noteId !== id));
  };

  return { notes, isLoading, error, setError, createNote, updateNote, deleteNote };
};