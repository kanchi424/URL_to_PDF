import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import UrlInput from './components/UrlInput';
import Dashboard from './components/Dashboard';
import DownloadBar from './components/DownloadBar';
import StatsBar from './components/StatsBar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [pages, setPages] = useState([]);

  const startCrawl = async (url) => {
    setIsLoading(true);
    setPages([]);
    setJobStatus(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/crawl`, { url });
      setJobId(response.data.job_id);
      pollStatus(response.data.job_id);
    } catch (error) {
      console.error("Error starting crawl:", error);
      setIsLoading(false);
      alert("Failed to start crawl. Please check if the backend is running.");
    }
  };

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/status/${id}`);
        const data = response.data;
        setJobStatus(data);
        setPages(data.pages || []);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setIsLoading(false);
          if (data.status === 'failed') {
            alert(`Job failed: ${data.error}`);
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-cyan-500/30">
      <div className="container mx-auto px-40 py-16 flex flex-col items-center justify-center min-h-screen relative z-10 text-center">

        <div className="mb-16">
          <h1 className="font-bold text-8xl md:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-red-200 select-none drop-shadow-2xl mb-4">
            URL TO PDF GENERATOR
          </h1>
          <p className="text-slate-400 text-lg italic tracking-wider">
            Enter a URL to convert the pages in the Website to PDF.
          </p>
        </div>


        <AnimatePresence mode="wait">
          {!jobId ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <UrlInput onStartCrawl={startCrawl} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full flex flex-col items-center gap-12"
            >
              <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <button
                  onClick={() => {
                    setJobId(null);
                    setJobStatus(null);
                    setPages([]);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all hover:-translate-x-1"
                >
                  <span>←</span> Start New Cycle
                </button>
                {jobStatus?.status === 'processing' && (
                  <span className="text-xs font-bold text-cyan-400 animate-pulse">PROCESSING...</span>
                )}
              </div>

              <div className="w-full max-w-6xl">
                <StatsBar jobStatus={jobStatus} pages={pages} />

                <Dashboard
                  jobStatus={jobStatus}
                  pages={pages}
                  jobId={jobId}
                  baseUrl={API_BASE_URL}
                />
              </div>

              <div className="w-full max-w-4xl mt-12">
                <DownloadBar
                  jobStatus={jobStatus}
                  baseUrl={API_BASE_URL}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;