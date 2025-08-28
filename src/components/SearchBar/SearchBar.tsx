"use client";
import React, { ReactElement } from "react";
import Notes from "../QuickNotes";
import { GoogleLogo } from "./Command";
import { SuggestionList } from "./SuggestionList";
import { useSearchBar } from "@/hooks/useSearch";

const SearchBar = (): ReactElement => {
    const {
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
    } = useSearchBar();

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
        </div>
    );
};

export default SearchBar;