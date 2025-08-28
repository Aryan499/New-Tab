"use client";
import { useState, useMemo, useRef, useEffect, KeyboardEvent } from "react";
import { Command, Suggestion } from "@/types/Search.types";
import { commands } from "@/components/SearchBar/Command";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { getRecentSearches, addRecentSearch } from "@/lib/searchHistory";

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

export const useSearchBar = () => {
    // --- STATE MANAGEMENT ---
    const [autoCompleteSuggestion, setAutoCompleteSuggestion] = useState('');
    const [activeCommand, setActiveCommand] = useState<Command | null>(null);
    const [value, setValue] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [notesOpen, setNotesOpen] = useState<boolean>(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- SIDE EFFECTS ---
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // --- DERIVED STATE ---
    const suggestions: Suggestion[] = useMemo(() => {
        if (!isFocused || activeCommand) return [];
        const lowerCaseValue = value.toLowerCase();

        if (value.startsWith('@')) {
            const searchTerm = value.substring(1);
            const filteredCommands = commands.filter(c => c.type.startsWith(searchTerm));
            return filteredCommands.map(cmd => ({ type: 'command', data: cmd }));
        }

        const filteredHistory = value.trim() !== '' 
            ? recentSearches
                .filter(item => item.toLowerCase().includes(lowerCaseValue) && item.toLowerCase() !== lowerCaseValue)
                .map(item => ({ type: 'history', data: item } as Suggestion))
            : [];
        
        const initialCommands = value === "" ? commands.map(cmd => ({ type: 'command', data: cmd } as Suggestion)) : [];
        return [...initialCommands, ...filteredHistory];
    }, [value, isFocused, activeCommand, recentSearches]);

    const showSuggestions = isFocused && suggestions.length > 0 && !activeCommand;

    const ghostValue = autoCompleteSuggestion.toLowerCase().startsWith(value.toLowerCase()) 
                       ? value + autoCompleteSuggestion.substring(value.length)
                       : '';

    // --- HANDLERS ---
    const handleInputChange = (newValue: string) => {
        setValue(newValue);
        setAutoCompleteSuggestion('');

        if (!newValue || activeCommand) return;

        const lowerCaseValue = newValue.toLowerCase();
        if (lowerCaseValue.startsWith('@')) {
            const match = commands.find(cmd => cmd.name.toLowerCase().startsWith(lowerCaseValue));
            if (match && match.name.toLowerCase() !== lowerCaseValue) {
                setAutoCompleteSuggestion(match.name);
            }
        } else {
            const match = recentSearches.find(item => item.toLowerCase().startsWith(lowerCaseValue));
            if (match && match.toLowerCase() !== lowerCaseValue) {
                setAutoCompleteSuggestion(match);
            }
        }
    };

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

    const handleSuggestionSelect = (suggestion: Suggestion) => {
        if (suggestion.type === 'command') {
            const command = suggestion.data;
            if (command.type === 'search') {
                setActiveCommand(command);
                setValue('');
                inputRef.current?.focus();
            } else {
                if (command.type === 'quicknote') setNotesOpen(true);
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

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
            if (!trimmedValue) return;

            const commandMatch = commands.find(cmd => cmd.name === trimmedValue);
            if (commandMatch) {
                handleSuggestionSelect({ type: 'command', data: commandMatch });
                return;
            }

            if (activeCommand && activeCommand.url) {
                const newHistory = addRecentSearch(`${activeCommand.name}=${trimmedValue}`);
                setRecentSearches(newHistory);
                window.location.href = `${activeCommand.url}${encodeURIComponent(trimmedValue)}`;
            } else {
                performSearch(trimmedValue);
            }
        }
    };

    // --- RETURN VALUES ---
    return {
        value,
        isFocused,
        activeCommand,
        notesOpen,
        ghostValue,
        suggestions,
        showSuggestions,
        inputRef,
        handleInputChange,
        handleKeyDown,
        handleSuggestionSelect,
        setIsFocused,
        setNotesOpen,
        selectedIndex,
    };
};