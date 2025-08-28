"use client";
import React, { useState, useMemo, useRef, ReactElement } from "react";
import Notes from "../QuickNotes";
import Chat from "../Chat/Chat";
import { Command } from "@/types/Search.types";
import { commands, GoogleLogo } from "./Command";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { SuggestionList } from "./SuggestionList";

// --- NEW HELPER FUNCTIONS FOR URL HANDLING ---
const isValidUrl = (string: string): boolean => {
    // A regex to check for patterns like http://, domain.tld, localhost, etc.
    const urlRegex = /^(https?:\/\/)?(localhost|[\w.-]+(\.[\w.-]+)+)[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return urlRegex.test(string);
};

const prefixUrl = (url: string): string => {
    if (!/^(https?:\/\/)/i.test(url)) {
        return `https://${url}`;
    }
    return url;
};


const SearchBar = (): ReactElement => {
    const [activeCommand, setActiveCommand] = useState<Command | null>(null);
    const [value, setValue] = useState<string>(""); 
    
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [notesOpen, setNotesOpen] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestions = useMemo(() => {
        if (!isFocused || activeCommand) return [];
        if (value.startsWith('@')) {
            const searchTerm = value.substring(1).toLowerCase();
            return commands.filter(c => c.type.startsWith(searchTerm));
        }
        if (value === "") return commands;
        return [];
    }, [value, isFocused, activeCommand]);

    const executeCommand = (command: Command) => {
        if (command.type === 'search') {
            setActiveCommand(command);
            setValue('');
            inputRef.current?.focus();
        } else {
            if (command.type === 'quicknote') setNotesOpen(true);
            if (command.type === 'chat') setChatOpen(true);
            if (command.url) window.location.href = command.url;
            setValue('');
        }
    };

    const { selectedIndex, handleKeyDown: handleNavKeyDown } = useKeyboardNav(
        suggestions.length,
        (index) => executeCommand(suggestions[index])
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && value === '' && activeCommand) {
            e.preventDefault();
            setActiveCommand(null);
            return;
        }

        handleNavKeyDown(e);

        if (e.key === 'Enter' && selectedIndex === -1) {
            const trimmedValue = value.trim();
            if (!trimmedValue) return;

            if (activeCommand && activeCommand.url) {
                window.location.href = `${activeCommand.url}${encodeURIComponent(trimmedValue)}`;
            } else {
                // --- UPDATED URL HANDLING LOGIC ---
                if (isValidUrl(trimmedValue)) {
                    window.location.href = prefixUrl(trimmedValue);
                } else {
                    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedValue)}`;
                }
            }
        }
    };

    const showSuggestions = isFocused && suggestions.length > 0 && !activeCommand;

    return (
        <div className="relative w-full max-w-[700px] mx-auto font-sans">
            <div className={`relative flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 transition-all duration-200 ease-out ${isFocused ? 'shadow-2xl shadow-blue-400 border-2 border-blue-400' : ''} transition-all duration-100 ease-linear ${showSuggestions ? 'rounded-t-3xl' : 'rounded-full'}`}>
                
                {activeCommand ? (
                    <>

                        <div className="flex items-center gap-2 pr-2 mr-2 border-r border-slate-600 flex-shrink-0 text-white">
                            {activeCommand.icon}
                            <span className="text-xs uppercase tracking-wider text-slate-300 font-medium   ">{activeCommand.name.replace('@', '')}</span>
                        </div>
                       

                    
                    </>
                ) : (
                    <div className="px-2">
                        <GoogleLogo />
                    </div>
                )}
                
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={activeCommand ? `Search ${activeCommand.name.replace('@', '')}...` : "Search Google or type @ for commands"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)}
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