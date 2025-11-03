import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface SearchBarProps {
  placeholder?: string;
  onResultClick?: (result: any) => void;
  showSuggestions?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search articles...',
  onResultClick,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2 && showSuggestions) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300); // Debounce

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.searchSuggestions(query);
      if (response.success && response.data) {
        setSuggestions([
          ...(response.data.articles || []),
          ...(response.data.categories || [])
        ]);
        setShowSuggestionsList(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchTerm)}`);
      setShowSuggestionsList(false);
      if (onResultClick) {
        onResultClick({ query: searchTerm });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.slug) {
      // It's an article
      navigate(`/articles/${suggestion.id}`);
    } else if (suggestion.category_id) {
      // It's a category
      navigate(`/articles?category=${suggestion.id}`);
    }
    setShowSuggestionsList(false);
    setQuery('');
    if (onResultClick) {
      onResultClick(suggestion);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => query.length >= 2 && setShowSuggestionsList(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestionsList(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="font-medium">{suggestion.title || suggestion.name}</div>
                {suggestion.slug && (
                  <div className="text-xs text-gray-500">{suggestion.slug}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchBar;

