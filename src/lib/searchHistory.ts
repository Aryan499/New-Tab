const STORAGE_KEY = 'search-bar-history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Retrieves the list of recent searches from localStorage.
 */
export const getRecentSearches = (): string[] => {
    try {
        const items = window.localStorage.getItem(STORAGE_KEY);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return [];
    }
};

/**
 * Adds a new search query to the history.
 */
export const addRecentSearch = (query: string): string[] => {
    if (!query) return getRecentSearches();

    const currentSearches = getRecentSearches();
    
    // Remove existing instance of the query to move it to the top
    const filteredSearches = currentSearches.filter(item => item.toLowerCase() !== query.toLowerCase());

    // Add the new query to the beginning of the array
    const newSearches = [query, ...filteredSearches];

    // Enforce the max limit
    const limitedSearches = newSearches.slice(0, MAX_HISTORY_ITEMS);

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSearches));
        return limitedSearches;
    } catch (error) {
        console.error("Error writing to localStorage", error);
        return currentSearches; // Return original list on error
    }
};