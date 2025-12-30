import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaFilePdf, FaVideo, FaClock, FaCheckCircle } from 'react-icons/fa';

const StatsBar = ({ jobStatus, pages }) => {
    if (!jobStatus) return null;

    const totalPages = pages.length;
    const completedPages = pages.filter(p => p.pdf_path).length;
    const videosDetected = pages.filter(p => p.has_video).length;
    const progress = totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 mb-6"
        >
            <div className="grid grid-cols-4 gap-6">
                {/* Total Pages */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FaGlobe className="text-cyan-400 text-xl" />
                        <span className="text-2xl font-bold text-white">{totalPages}</span>
                    </div>
                    <p className="text-sm text-slate-400">Pages Found</p>
                </div>

                {/* Completed */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FaCheckCircle className="text-emerald-400 text-xl" />
                        <span className="text-2xl font-bold text-red-500">{completedPages}</span>
                    </div>
                    <p className="text-sm text-slate-400">PDFs Generated</p>
                </div>

                {/* Videos */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FaVideo className="text-red-400 text-xl" />
                        <span className="text-2xl font-bold text-white">{videosDetected}</span>
                    </div>
                    <p className="text-sm text-slate-400">Videos Detected</p>
                </div>

                {/* Progress */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FaClock className="text-yellow-400 text-xl" />
                        <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                    </div>
                    <p className="text-sm text-slate-400">Progress</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-slate-800/50 rounded-full h-3 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
            </div>
        </motion.div>
    );
};

export default StatsBar;
