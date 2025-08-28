"use client";
import React, { useState, useMemo, useRef, ReactElement, useEffect } from "react";
import Notes from "../QuickNotes";
import Chat from "../Chat/Chat";
import { Command, Suggestion } from "@/types/Search.types";
import { commands, GoogleLogo } from "./Command";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { SuggestionList } from "./SuggestionList";
import { getRecentSearches, addRecentSearch } from "@/lib/searchHistory";
import { History } from "lucide-react";

// Helper functions for URL validation and formatting
const isValidUrl = (string: string): boolean => {
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
    // State for inline autocomplete
    const [autoCompleteSuggestion, setAutoCompleteSuggestion] = useState('');
    
    // Other component states
    const [activeCommand, setActiveCommand] = useState<Command | null>(null);
    const [value, setValue] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [notesOpen, setNotesOpen] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    
    // Load search history from localStorage when the component mounts
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // Main input change handler with autocomplete logic
    const handleInputChange = (newValue: string) => {
        setValue(newValue);
        if (newValue && !activeCommand && !newValue.startsWith('@')) {
            const match = recentSearches.find(item => item.toLowerCase().startsWith(newValue.toLowerCase()));
            setAutoCompleteSuggestion(match || '');
        } else {
            setAutoCompleteSuggestion('');
        }
    };
    
    // Memoized calculation for the suggestions dropdown
    const suggestions: Suggestion[] = useMemo(() => {
        if (!isFocused || activeCommand) return [];
        const lowerCaseValue = value.toLowerCase();

        if (value.startsWith('@')) {
            const searchTerm = value.substring(1);
            const filteredCommands = commands.filter(c => c.type.startsWith(searchTerm));
            return filteredCommands.map(cmd => ({ type: 'command', data: cmd }));
        }

        const filteredHistory = recentSearches
            .filter(item => item.toLowerCase().includes(lowerCaseValue) && item.toLowerCase() !== lowerCaseValue)
            .map(item => ({ type: 'history', data: item } as Suggestion));
        
        const initialCommands = value === "" ? commands.map(cmd => ({ type: 'command', data: cmd } as Suggestion)) : [];
        return [...initialCommands, ...filteredHistory];
    }, [value, isFocused, activeCommand, recentSearches]);

    // Central function for performing a search
    const performSearch = (query: string) => {
        const trimmedValue = query.trim();
        if (!trimmedValue) return;

        const newHistory = addRecentSearch(trimmedValue);
        setRecentSearches(newHistory);
        
        if (isValidUrl(trimmedValue)) {
            window.location.href = prefixUrl(trimmedValue);
        } else {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedValue)}`;
        }
    };

    // Handler for selecting an item from the suggestions dropdown
    const handleSuggestionSelect = (suggestion: Suggestion) => {
        if (suggestion.type === 'command') {
            const command = suggestion.data;
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
        } else if (suggestion.type === 'history') {
            setValue(suggestion.data);
            performSearch(suggestion.data);
        }
    };

    const { selectedIndex, handleKeyDown: handleNavKeyDown } = useKeyboardNav(
        suggestions.length,
        (index) => handleSuggestionSelect(suggestions[index])
    );

    // Main keydown handler for the input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && autoCompleteSuggestion) {
            if (inputRef.current && inputRef.current.selectionStart === value.length) {
                e.preventDefault();
                handleInputChange(autoCompleteSuggestion);
                return;
            }
        }
        
        if (e.key === 'Backspace' && value === '' && activeCommand) {
            e.preventDefault();
            setActiveCommand(null);
            return;
        }
        
        handleNavKeyDown(e);

        if (e.key === 'Enter' && selectedIndex === -1) {
            const trimmedValue = value.trim();
            if (activeCommand && activeCommand.url) {
                const newHistory = addRecentSearch(`${activeCommand.name}=${trimmedValue}`);
                setRecentSearches(newHistory);
                window.location.href = `${activeCommand.url}${encodeURIComponent(trimmedValue)}`;
            } else {
                performSearch(trimmedValue);
            }
        }
    };
    
    const showSuggestions = isFocused && suggestions.length > 0 && !activeCommand;

    const ghostValue = autoCompleteSuggestion.toLowerCase().startsWith(value.toLowerCase()) 
                       ? value + autoCompleteSuggestion.substring(value.length)
                       : '';

    return (
        <div className="relative w-full max-w-[700px] mx-auto font-sans">
            <div className={`relative flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 transition-all duration-100 ease-linear ${isFocused ? 'shadow-2xl shadow-blue-300/50 border-2 border-blue-300' : ''} ${showSuggestions ? 'rounded-t-3xl' : 'rounded-full'}`}>
                {activeCommand ? (
                    <div className="flex items-center gap-2 pr-2 mr-2 border-r border-slate-600 flex-shrink-0 text-white">
                        {activeCommand.icon}
                        <span className="text-sm font-light text-slate-400">
                            {activeCommand.name.replace('@', '')}
                        </span>
                    </div>
                ) : (
                    <div className="px-2">
                        <GoogleLogo />
                    </div>
                )}
                
                <div className="relative flex-1 w-full grid grid-cols-1 grid-rows-1">
                    <input
                        type="text"
                        value={ghostValue}
                        readOnly
                        className="col-start-1 row-start-1 p-0 bg-transparent text-gray-500 placeholder:text-gray-500 outline-none text-base pointer-events-none"
                        aria-hidden="true"
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={activeCommand ? `Search ${activeCommand.name.replace('@', '')}...` : "Search Google or type @ for commands"}
                        value={value}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        className="col-start-1 row-start-1 p-0 bg-transparent text-gray-200 placeholder:text-gray-500 outline-none text-base"
                    />
                </div>
            </div>
            
            {showSuggestions && (
                <SuggestionList
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                    onSuggestionClick={handleSuggestionSelect}
                />
            )}
            
            <Notes open={notesOpen} setOpen={setNotesOpen} />
            <Chat open={chatOpen} setOpen={setChatOpen} />
        </div>
    );
};

export default SearchBar;