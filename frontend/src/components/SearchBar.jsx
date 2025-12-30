import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ onSearch, totalResults }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className="glass-panel p-4 mb-4">
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search pages by title or URL..."
                    className="w-full bg-slate-800/50 border border-slate-700 text-cyan-100 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-cyan-400 transition-all font-medium"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
            {searchTerm && (
                <p className="text-sm text-slate-400 mt-2">
                    Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
};

export default SearchBar;
