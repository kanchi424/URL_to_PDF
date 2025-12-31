import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilePdf, FaVideo, FaCheckCircle, FaSpinner, FaGlobe, FaChevronRight } from 'react-icons/fa';
import SearchBar from './SearchBar';

const Dashboard = ({ jobStatus, pages, jobId, baseUrl }) => {
    const [selectedPage, setSelectedPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPages = pages.filter(page =>
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.url?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (filteredPages && filteredPages.length > 0 && !selectedPage) {
            setSelectedPage(filteredPages[0]);
        }
    }, [filteredPages, selectedPage]);

    if (!jobStatus) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[calc(100vh-250px)] w-full max-w-7xl mx-auto gap-6 px-4"
        >
            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Left Panel: Page List */}
                <div className="w-1/3 glass-panel flex flex-col overflow-hidden group">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-800">
                        <h3 className="font-bold text-white tracking-wide uppercase text-sm flex items-center gap-2">
                            <FaGlobe className="text-cyan-400" /> Detected Pages
                        </h3>
                        <span className="text-xs font-mono bg-slate-700 text-cyan-400 px-2 py-1 rounded">
                            {pages.length}
                        </span>
                    </div>

                    <SearchBar onSearch={setSearchTerm} totalResults={filteredPages.length} />

                    <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                        <AnimatePresence>
                            {filteredPages.map((page, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedPage(page)}
                                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${selectedPage === page
                                        ? 'bg-slate-700 border-red-400/70 shadow-xl'
                                        : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-red-400/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 relative">
                                        {/* Icon on the Left */}
                                        <div className="flex-shrink-0">
                                            {page.pdf_path ? (
                                                <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                                                    <FaFilePdf size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                    <FaSpinner className="animate-spin text-cyan-400" size={18} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-lg leading-tight ${selectedPage === page ? 'text-white' : 'text-slate-100'}`}>
                                                {page.title || 'Untitled'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono truncate mt-1">
                                                {page.url}
                                            </p>
                                        </div>

                                        {/* Download on the Right */}
                                        {page.pdf_path && (
                                            <a
                                                href={`${baseUrl}/${page.pdf_path}`}
                                                download
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 border border-white/10 text-white p-2 rounded-lg transition-all"
                                                title="Download PDF"
                                            >
                                                <FaFilePdf size={16} />
                                            </a>
                                        )}
                                    </div>

                                    {page.has_video && (
                                        <div className="absolute top-3 right-3">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse block"></span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {jobStatus.status === 'processing' && (
                            <div className="p-4 text-center text-slate-400 animate-pulse flex items-center justify-center gap-2 border-t border-white/5">
                                <FaSpinner className="animate-spin text-cyan-400" size={14} />
                                <span className="text-xs font-medium">Scanning...</span>
                            </div>
                        )}

                        {jobStatus.status === 'completed' && (
                            <div className="p-4 space-y-2 border-t border-white/5 bg-slate-800/30">
                                <a
                                    href={`${baseUrl}/${jobStatus.merged_pdf_path}`}
                                    download
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    <FaFilePdf /> DOWNLOAD MERGED PDF
                                </a>
                                <a
                                    href={`${baseUrl}/${jobStatus.zip_path}`}
                                    download
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    Download all pages (ZIP)
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: PDF Preview */}
                <div className="w-2/3 glass-panel flex flex-col overflow-hidden relative">
                    {selectedPage && selectedPage.pdf_path ? (
                        <iframe
                            src={`${baseUrl}/${selectedPage.pdf_path}#toolbar=0&view=FitH`}
                            className="w-full h-full border-none bg-slate-900"
                            title="PDF Preview"
                        />
                    ) : selectedPage ? (
                        <div className="flex items-center justify-center h-full flex-col gap-6 text-center bg-slate-800">
                            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-2">Generating PDF</h4>
                                <p className="text-slate-400 text-sm">Please wait a moment...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-center flex-col gap-4 bg-slate-800">
                            <FaFilePdf className="text-7xl opacity-10" />
                            <p className="font-medium text-slate-400">Select a page to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
