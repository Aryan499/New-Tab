"use client";
import React, { useState,  useRef, useMemo,  ReactElement } from "react";
import Notes from "../QuickNotes";
import Chat from "../Chat/Chat";
import { Command } from "@/types/Search.types";
import { commands, GoogleLogo, YouTubeLogo } from "./Command";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { SuggestionList } from "./SuggestionList";
import { FileIcon } from "lucide-react";

const SearchBar = (): ReactElement => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const [notesOpen, setNotesOpen] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- State and Logic for Suggestions ---
    const suggestions = useMemo(() => {
        if (!isFocused) return [];
        if (value === "") return commands;
        if (value.startsWith('@')) {
            const searchTerm = value.substring(1).toLowerCase().split('=')[0];
            return commands.filter(c => c.type.startsWith(searchTerm));
        }
        return [];
    }, [value, isFocused]);
    
    // --- Command Handling ---
    const executeCommand = (command: Command) => {
        setValue(command.format); // Set input value to the command format
        inputRef.current?.focus(); // Keep focus on the input

        // For commands that don't need a query, execute immediately
        if (command.type === 'quicknote') setNotesOpen(true);
        if (command.type === 'chat') setChatOpen(true);
        if (command.url && !command.url.includes('?search_query=')) {
             window.location.href = command.url;
        }
    };

    // --- Keyboard Navigation Hook ---
    const { selectedIndex, handleKeyDown: handleNavKeyDown } = useKeyboardNav(
        suggestions.length,
        (index) => executeCommand(suggestions[index])
    );
    
    // --- Main Search/Key Handler ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Give priority to the navigation hook
        handleNavKeyDown(e);

        if (e.key === 'Enter' && selectedIndex === -1) {
            const trimmedValue = value.trim();
            if (!trimmedValue) return;

            // Command search logic
            if (trimmedValue.startsWith('@')) {
                const parts = trimmedValue.substring(1).split('=', 2);
                const cmdType = parts[0];
                const query = parts.length > 1 ? parts[1].trim() : null;
                const command = commands.find(c => c.type === cmdType);
                
                if (command?.type === 'search' && query) {
                    window.location.href = `${command.url}${encodeURIComponent(query)}`;
                    return;
                }
            }
            // Default to Google search
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedValue)}`;
        }
    };

    const showSuggestions = isFocused && suggestions.length > 0;
    
    // --- Dynamic Icon Rendering ---
    const activeIcon = useMemo(() => {
        const youtubeCommands = ['search', 'history', 'playlists'];
        if (value.startsWith('@')) {
            const commandType = value.substring(1).split('=')[0];
            if (youtubeCommands.includes(commandType)) return <YouTubeLogo />;
            if (commandType === 'quicknote') return <FileIcon className="text-white" />;
        }
        return <GoogleLogo />;
    }, [value]);

    return (
        <div className="relative w-full max-w-[700px] mx-auto font-sans">
            <div className={`relative flex items-center gap-3 px-6 py-4 bg-slate-800 border border-slate-700 transition-all duration-200 ease-out ${isFocused ? 'shadow-2xl shadow-blue-300/50 border-2 border-blue-300' : ''} ${showSuggestions ? 'rounded-t-3xl' : 'rounded-full'}`}>
                <div className="flex-shrink-0">{activeIcon}</div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Google or type @ for commands"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow suggestion click
                    className="flex-1 w-full bg-transparent text-gray-200 placeholder:text-gray-500 outline-none text-base"
                />
            </div>

            {showSuggestions && (
                <SuggestionList
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    onSuggestionClick={executeCommand}
                />
            )}
            
            <Notes open={notesOpen} setOpen={setNotesOpen} />
            <Chat open={chatOpen} setOpen={setChatOpen} />
        </div>
    );
};

export default SearchBar;