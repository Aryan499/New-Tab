"use client";
import React, { useState, useEffect, useRef, ReactElement } from "react";
import Notes from "../QuickNotes/Notes";

// --- Type Definition for a Command ---
interface Command {
  type: string;
  name: string;
  description: string;
  url?: string; // Optional as quicknote doesn't have it
  icon: ReactElement;
  format: string;
}

// --- SVG Icon Components ---
const SearchIcon = (): ReactElement => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const HistoryIcon = (): ReactElement => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6"></path>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);
const PlaylistIcon = (): ReactElement => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);
const FileIcon = (): ReactElement => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

// Main Logos for the search bar
const GoogleLogo = (): ReactElement => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);
const YouTubeLogo = (): ReactElement => (
    <svg width="20" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.4 3.1s-.3-2.1-1.2-3C25.2.3 24 .3 22.8.3 19 .3 14 .3 14 .3s-5 0-8.8.3C4 .3 2.8.3 1.8 1.1.9 2.1.6 4.2.6 4.2S.3 6.6.3 9v2c0 2.4.3 4.8.3 4.8s.3 2.1 1.2 3c1 .8 2.4.8 3.7.9 2.8.2 8.5.3 8.5.3s5 0 8.8-.3c1.2 0 2.4 0 3.4-.8 1-.8 1.2-2.9 1.2-2.9s.3-2.4.3-4.8v-2c0-2.4-.3-4.8-.3-4.8z" fill="#FF0000"/>
        <path d="M11.2 14V6l6 4-6 4z" fill="white"/>
    </svg>
);

// --- Data source for all commands ---
const commands: Command[] = [
  { type: 'search', name: '@search', description: 'Search on YouTube', url: 'https://www.youtube.com/results?search_query=', icon: <SearchIcon />, format: '@search=' },
  { type: 'history', name: '@history', description: 'View YouTube history', url: 'https://www.youtube.com/feed/history', icon: <HistoryIcon />, format: '@history' },
  { type: 'playlists', name: '@playlists', description: 'View YouTube playlists', url: 'https://www.youtube.com/feed/playlists', icon: <PlaylistIcon />, format: '@playlists' },
  { type: 'quicknote', name: '@quicknote', description: 'Save a quick note (example)', icon: <FileIcon />, format: '@quicknote' },  
];

const SearchBar = (): ReactElement => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Command[]>([]);
  const [activeCommandType, setActiveCommandType] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  // This effect now ONLY handles the icon state, based on the input value
  useEffect(() => {
    if (value.startsWith('@')) {
        const commandType = value.substring(1).toLowerCase().split('=')[0];
        const command = commands.find(c => c.type === commandType);
        setActiveCommandType(command ? command.type : null);
    } else {
        setActiveCommandType(null);
    }
  }, [value]);

  // This effect ONLY handles the suggestions dropdown visibility
  useEffect(() => {
    if (isFocused && value.startsWith('@')) {
      const searchTerm = value.substring(1).toLowerCase().split('=')[0];
      const filtered = commands.filter(c => c.type.startsWith(searchTerm));
      setSuggestions(filtered);
    } else if (isFocused && value === "") {
      setSuggestions(commands);
    } else {
      setSuggestions([]);
    }
  }, [value, isFocused]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedValue = value.trim();
    if (e.key !== 'Enter' || !trimmedValue) return;

    if (trimmedValue.startsWith('@')) {
      const parts = trimmedValue.substring(1).split('=', 2);
      const commandType = parts[0];
      const query = parts.length > 1 ? parts[1].trim() : null;
      const command = commands.find(k => k.type === commandType);

      if (command) {
        e.preventDefault();
        if (command.type === 'search' && query) {
          window.location.href = `${command.url}${encodeURIComponent(query)}`;
        } else if (command.type === 'quicknote') {
          setOpen(true);
          setValue('');
        } else if (command.url && !query) {
          window.location.href = command.url;
        }
        return;
      }
    }
    
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedValue)}`;
  };

  const handleSuggestionClick = (command: Command) => {
    setValue(command.format);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const showSuggestions = isFocused && suggestions.length > 0;
  
  const renderActiveIcon = (): ReactElement => {
    const youtubeCommands = ['search', 'history', 'playlists'];
    if (activeCommandType && youtubeCommands.includes(activeCommandType)) {
      return <YouTubeLogo />;
    }
    if (activeCommandType === 'quicknote') {
      return <FileIcon />;
    }
    return <GoogleLogo />;
  };

  return (
    <div className="relative w-full max-w-[700px] mx-auto font-sans">
      <div 
        className={`
          relative flex items-center gap-3 px-6 py-4 
          bg-slate-800 border border-slate-700
          transition-all duration-200 ease-out
          ${isFocused ? 'shadow-2xl shadow-blue-300/50 border-2 border-blue-300' : ''}
          ${showSuggestions ? 'rounded-t-3xl rounded-b-none' : 'rounded-full'}
        `}
      >
        <div className="flex-shrink-0">
          {renderActiveIcon()}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Google or type @ for commands"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="flex-1 w-full bg-transparent text-gray-200 placeholder:text-gray-500 outline-none text-base"
        />
      </div>

      {showSuggestions && (
        <div 
          className="
            absolute top-full w-full p-2
            bg-slate-800 border-2 border-t-0 border-blue-300
            shadow-2xl shadow-blue-300/50
            rounded-b-3xl overflow-hidden z-10
          "
        >
          <ul>
            {suggestions.map((cmd) => (
              <li 
                key={cmd.type}
                onMouseDown={() => handleSuggestionClick(cmd)}
                className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors duration-150"
              >
                <span className="text-blue-300 flex-shrink-0">{cmd.icon}</span>
                <div className="overflow-hidden">
                  <p className="text-gray-100 font-medium truncate">{cmd.name}</p>
                  <p className="text-sm text-gray-400 truncate">{cmd.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Notes open={open} setOpen={setOpen} />
    </div>
  );
};

export default SearchBar;
