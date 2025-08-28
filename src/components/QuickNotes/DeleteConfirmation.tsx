import { Button } from "@/components/ui/button";
import { Trash2, X, CalendarDays } from "lucide-react";
import { NoteType } from "@/types/NoteType.types";
import { formatDate } from "@/lib/utils";

type DeleteConfirmationProps = {
  note: NoteType;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmation = ({ note, onConfirm, onCancel }: DeleteConfirmationProps) => (
  <div className="h-full flex flex-col items-center justify-center">
    <div className="text-center max-w-md">
      <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Delete Note</h2>
      <p className="text-gray-300 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-white mb-2" title={note.title}>{note.title || 'Untitled'}</h3>
        <p className="text-gray-300 text-sm line-clamp-3" title={note.content}>{note.content || 'No content'}</p>
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>Created: {formatDate(note.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button onClick={onCancel} variant="outline" className="border-slate-600">
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete Note
        </Button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmation;