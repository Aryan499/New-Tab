import { Loader2 } from "lucide-react";
import NoteCard from "./NoteCard";
import { NoteType } from "@/types/NoteType.types";

type NoteListProps = {
  notes: NoteType[];
  isLoading: boolean;
  searchTerm: string;
  onEdit: (note: NoteType) => void;
  onDelete: (note: NoteType) => void;
};
const NoteList = ({ notes, isLoading, searchTerm, onEdit, onDelete }: NoteListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading notes...
      </div>
    );
  }
 console.log("Notes:", notes)
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log("Filtered Notes:", filteredNotes)
  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {searchTerm ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
      {filteredNotes.map(note => {
        return (
          <NoteCard key={note.noteId} note={note} onEdit={() => onEdit(note)} onDelete={() => onDelete(note)} />
        );
      })}
    </div>
  );
};

export default NoteList;