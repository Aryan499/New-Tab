import { useState, useEffect, useCallback } from 'react';

export const useKeyboardNav = (itemCount: number, onSelect: (index: number) => void) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Reset index when the list of items changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [itemCount]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (itemCount === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % itemCount);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount);
                break;
            case 'Enter':
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    onSelect(selectedIndex);
                }
                break;
            case 'Escape':
                 setSelectedIndex(-1); // Optionally hide suggestions on Escape
                 break;
        }
    }, [itemCount, onSelect, selectedIndex]);

    return { selectedIndex, handleKeyDown };
};