import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, RefreshCw, Trash2 } from "lucide-react";
import { NoteType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type NoteCardProps = {
  note: NoteType;
  onEdit: (note: NoteType) => void;
  onDelete: (note: NoteType) => void;
};

const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => (
  <Card className="group bg-slate-800 border-slate-600 h-48 flex flex-col hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200">
    <CardContent className="p-3 flex flex-col h-full">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-white truncate pr-2 flex-1" title={note.title}>{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={() => onEdit(note)} className="p-1 h-6 w-6 hover:bg-slate-700" title="Edit note">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(note)} className="p-1 h-6 w-6 hover:bg-red-600" title="Delete note">
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
            <span title={`Updated: ${formatDate(note.updatedAt)}`}><RefreshCw className="h-2 w-2 ml-1" /></span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default NoteCard;