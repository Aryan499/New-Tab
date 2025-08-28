import React from 'react';
import { Suggestion } from '@/types/Search.types';
import { History } from 'lucide-react';

type SuggestionListProps = {
    suggestions: Suggestion[];
    selectedIndex: number;
    onSuggestionClick: (suggestion: Suggestion) => void;
};

export const SuggestionList = ({ suggestions, selectedIndex, onSuggestionClick }: SuggestionListProps) => {
    return (
        <div className="absolute top-full w-full p-2 bg-slate-800 border-2 border-t-0 border-blue-300 shadow-2xl shadow-blue-300/50 rounded-b-3xl z-10">
            <ul>
                {suggestions.map((suggestion, index) => {
                    // --- UNIFIED UI LOGIC ---
                    // We determine the content for our single layout based on the suggestion type.
                    const icon = suggestion.type === 'command' ? suggestion.data.icon : <History size={20} />;
                    const title = suggestion.type === 'command' ? suggestion.data.name : suggestion.data;
                    const description = suggestion.type === 'command' ? suggestion.data.description : 'Recent Search';

                    return (
                        <li
                            key={title + description}
                            onMouseDown={() => onSuggestionClick(suggestion)}
                            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors duration-150 ${index === selectedIndex ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
                        >
                            <span className={suggestion.type === 'command' ? "text-blue-300 flex-shrink-0" : "text-gray-500 flex-shrink-0"}>
                                {icon}
                            </span>
                            <div className="overflow-hidden">
                                <p className="text-gray-100 font-medium truncate">{title}</p>
                                <p className="text-sm text-gray-400 truncate">{description}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};