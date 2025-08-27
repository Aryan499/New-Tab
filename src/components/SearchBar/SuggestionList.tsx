import React from 'react';
import { Command } from '@/types/Search.types';

type SuggestionListProps = {
    suggestions: Command[];
    selectedIndex: number;
    onSuggestionClick: (command: Command) => void;
};

export const SuggestionList = ({ suggestions, selectedIndex, onSuggestionClick }: SuggestionListProps) => {
    return (
        <div className="absolute top-full w-full p-2 bg-slate-800 border-2 border-t-0 border-blue-300 shadow-2xl shadow-blue-300/50 rounded-b-3xl z-10">
            <ul>
                {suggestions.map((cmd, index) => (
                    <li
                        key={cmd.type}
                        // Use onMouseDown to prevent the input's onBlur from firing first
                        onMouseDown={() => onSuggestionClick(cmd)}
                        className={`
                            flex items-center gap-4 p-3 rounded-xl cursor-pointer
                            transition-colors duration-150
                            ${index === selectedIndex ? 'bg-slate-700' : 'hover:bg-slate-700'}
                        `}
                    >
                        <span className="text-blue-300 flex-shrink-0">{cmd.icon}</span>
                        <div>
                            <p className="text-gray-100 font-medium">{cmd.name}</p>
                            <p className="text-sm text-gray-400">{cmd.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};