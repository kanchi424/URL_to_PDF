import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaArrowRight, FaLink } from 'react-icons/fa';

const UrlInput = ({ onStartCrawl, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && !isLoading) {
      onStartCrawl(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="relative w-full group flex items-center">
        <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl transition duration-500 opacity-20 group-hover:opacity-40 ${isFocused ? 'opacity-60' : ''}`}></div>

        <div className="pl-4 text-cyan-400 text-xl">
          <FaLink />
        </div>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://example.com"
          className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:outline-none text-lg placeholder-slate-500 font-medium"
          required
          autoFocus
        />

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 px-5 py-2 m-1 text-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
          ) : (
            <>
              Convert <FaArrowRight className="text-sm" />
            </>
          )}
        </button>

      </form>
    </motion.div >
  );
};

export default UrlInput;
