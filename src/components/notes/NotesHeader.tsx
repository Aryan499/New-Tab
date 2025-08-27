import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

type NotesHeaderProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
};

const NotesHeader = ({ searchTerm, onSearchChange, onAddNew }: NotesHeaderProps) => (
  <CardHeader className="flex-shrink-0">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-white">Quick Notes</CardTitle>
        <CardDescription>Manage all your quick notes</CardDescription>
      </div>
      <Button onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" /> New Note
      </Button>
    </div>
    <div className="relative mt-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </CardHeader>
);

export default NotesHeader;