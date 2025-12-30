import React from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaFileArchive, FaFilePdf } from 'react-icons/fa';

const DownloadBar = ({ jobStatus, baseUrl }) => {
    if (!jobStatus || jobStatus.status !== 'completed') return null;

    return (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass-panel px-8 py-4 flex items-center gap-6 z-50 shadow-2xl"
        >
            <div className="text-sm text-slate-400 font-medium">
                Processing Completed: <span className="text-white font-bold ml-1">{jobStatus.total_pages}</span> Pages
            </div>

            <div className="h-8 w-[1px] bg-slate-700"></div>

            {/* Merged PDF Download */}
            {jobStatus.merged_pdf_path && (
                <>
                    <a
                        href={`${baseUrl}/${jobStatus.merged_pdf_path}`}
                        className="btn-primary flex items-center gap-3 no-underline text-white hover:text-white group"
                        download
                    >
                        <FaFilePdf className="group-hover:scale-110 transition-transform" />
                        <span>Download Merged PDF</span>
                    </a>
                    <div className="h-8 w-[1px] bg-slate-700"></div>
                </>
            )}

            {/* ZIP Download */}
            <a
                href={`${baseUrl}/${jobStatus.zip_path}`}
                className="btn-secondary flex items-center gap-3 no-underline text-white hover:text-white group"
                download
            >
                <FaFileArchive className="group-hover:scale-110 transition-transform" />
                <span>Download All (ZIP)</span>
            </a>
        </motion.div>
    );
};

export default DownloadBar;
