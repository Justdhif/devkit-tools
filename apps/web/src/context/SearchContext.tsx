'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextValue>({
  query: '',
  setQuery: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState('');

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
