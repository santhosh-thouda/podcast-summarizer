import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WaveformAnimation from "./WaveformAnimation";
import { FiUpload, FiDownload, FiSun, FiMoon, FiX, FiCheck, FiMic, FiFileText } from "react-icons/fi";
import { FaRegCopy, FaCheck } from "react-icons/fa";
import { MdVolumeUp } from "react-icons/md";

const PodcastSummarizer: React.FC = () => {
  // State
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isWaveformActive, setIsWaveformActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial dark mode based on system preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  // Stop waveform when summary is generated
  useEffect(() => {
    setIsWaveformActive(summary.length === 0);
  }, [summary]);

  // Floating background elements
  const FloatingElements = () => {
    const elements = 15;
    return (
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        {[...Array(elements)].map((_, i) => {
          const size = Math.random() * 100 + 50;
          const duration = 20 + Math.random() * 30;
          const delay = Math.random() * 5;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const opacity = darkMode ? 0.03 : 0.06;
          const color = darkMode 
            ? `rgba(138, 99, 242, ${opacity})` 
            : `rgba(74, 128, 240, ${opacity})`;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full blur-xl"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                left: `${x}%`,
                top: `${y}%`,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay,
              }}
            />
          );
        })}
      </div>
    );
  };

  // Modern color scheme
  const colors = darkMode ? {
    bg: "bg-[#0f0f15]",
    card: "bg-[#1a1a24]/90",
    text: "text-gray-100",
    accent: "text-[#8a63f2]",
    accentBg: "bg-[#8a63f2]",
    inputBg: "bg-[#252535]",
    border: "border-[#3e3e5a]",
    icon: "text-[#ff6b81]",
    shadow: "shadow-[0_8px_32px_rgba(138,99,242,0.15)]",
    buttonHover: "hover:bg-[#9a7af5]",
    buttonShadow: "0 0 15px rgba(138, 99, 242, 0.5)"
  } : {
    bg: "bg-gradient-to-br from-[#f8f9ff] to-[#e9ecff]",
    card: "bg-white/90",
    text: "text-gray-900",
    accent: "text-[#4a80f0]",
    accentBg: "bg-[#4a80f0]",
    inputBg: "bg-gray-50",
    border: "border-gray-200",
    icon: "text-[#ff4d6d]",
    shadow: "shadow-[0_8px_32px_rgba(74,128,240,0.15)]",
    buttonHover: "hover:bg-[#5c8df5]",
    buttonShadow: "0 0 15px rgba(74, 128, 240, 0.5)"
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError("File size too large (max 25MB)");
      return;
    }
    
    setUploadedFile(file);
    setShowConfirmation(true);
    setError(null);
  };

  const confirmFileProcessing = async () => {
    if (!uploadedFile) return;
    
    const formData = new FormData();
    formData.append("file", uploadedFile);

    setLoading(true);
    setShowConfirmation(false);
    setSummary([]);

    try {
      // Simulate API call with timeout for demo
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Server error");
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary.split("\n").filter((line: string) => line.trim()));
    } catch (err: any) {
      setError(err.message || "Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelFileProcessing = () => {
    setUploadedFile(null);
    setShowConfirmation(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTranscriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError("Transcript text cannot be empty.");
      return;
    }

    setLoading(true);
    setSummary([]);
    setError(null);

    try {
      // Simulate API call with timeout for demo
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary.split("\n").filter((line: string) => line.trim()));
    } catch (err: any) {
      setError(err.message || "Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const listenToSummary = () => {
    const summaryText = summary.join('. ');
    const utterance = new SpeechSynthesisUtterance(summaryText);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 relative overflow-hidden`}>
      {/* Floating background animation */}
      <FloatingElements />
      
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-6 left-6 z-50 p-4 rounded-full ${colors.card} backdrop-blur-sm shadow-lg ${colors.border} border flex items-center justify-center`}
        whileHover={{ scale: 1.1, boxShadow: colors.buttonShadow }}
        whileTap={{ scale: 0.9 }}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <FiSun className={`h-6 w-6 ${colors.icon}`} />
        ) : (
          <FiMoon className={`h-6 w-6 ${colors.icon}`} />
        )}
      </motion.button>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center relative z-10">
        <motion.div
          className={`w-full max-w-3xl ${colors.card} backdrop-blur-sm rounded-2xl ${colors.shadow} p-8 md:p-10 border ${colors.border} transition-all duration-300`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1
              className={`text-4xl md:text-5xl font-bold mb-3 ${colors.accent} font-sans flex items-center justify-center gap-3`}
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FiMic className="inline-block" />
              Podcast Summarizer
            </motion.h1>
            <motion.p 
              className={`${colors.text} opacity-80 font-sans text-lg`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3 }}
            >
              AI-powered summaries from audio or text
            </motion.p>
          </motion.div>

          <form onSubmit={handleTranscriptSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <motion.label 
                className={`block text-sm font-medium mb-3 ${colors.text} font-sans`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Upload Audio/Video/Text
              </motion.label>
              
              <motion.div
                className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${colors.border} ${uploadedFile ? colors.inputBg : `${colors.inputBg} hover:bg-opacity-50`} upload-button`}
                whileHover={{ scale: !uploadedFile ? 1.01 : 1 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.mp3,.wav,.m4a,.mpga,.mp4,.mpeg,.webm"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ 
                      backgroundColor: darkMode ? "rgba(138, 99, 242, 0.2)" : "rgba(74, 128, 240, 0.2)"
                    }}
                  >
                    <FiUpload className={`h-8 w-8 ${colors.accent}`} />
                  </motion.div>
                  <p className={`${colors.text} font-medium text-sm`}>
                    {uploadedFile ? uploadedFile.name : "Drag & drop or click to browse"}
                  </p>
                  <p className={`${colors.text} opacity-60 text-xs mt-1`}>
                    Supports: MP3, WAV, TXT, MP4 (max 25MB)
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Confirmation Dialog */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  className={`p-4 rounded-xl ${colors.inputBg} border ${colors.border}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`${colors.text} mb-3 text-sm`}>
                    Process <span className="font-semibold">{uploadedFile?.name}</span>?
                  </p>
                  <div className="flex gap-4">
                    <motion.button
                      type="button"
                      onClick={confirmFileProcessing}
                      className={`py-5 px-10 rounded-lg text-white text-lg font-sans ${colors.accentBg} ${colors.buttonHover} shadow-md flex items-center gap-3 summarize-button`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiCheck className="h-5 w-5" />
                      Summarize
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={cancelFileProcessing}
                      className={`py-5 px-10 rounded-lg text-lg font-sans ${colors.text} bg-opacity-20 ${colors.border} border flex items-center gap-3 cancel-button`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiX className="h-5 w-5" />
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`flex-1 h-px ${colors.border} bg-opacity-50`}></div>
              <span className={`${colors.text} text-xs opacity-50 font-sans`}>OR</span>
              <div className={`flex-1 h-px ${colors.border} bg-opacity-50`}></div>
            </motion.div>

            {/* Text Input */}
            <div>
              <motion.label 
                className={`block text-sm font-medium mb-3 ${colors.text} font-sans flex items-center gap-2`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FiFileText className="h-4 w-4" />
                Paste Transcript Text
              </motion.label>
              <motion.textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your podcast transcript here..."
                rows={5}
                className={`w-full p-4 rounded-xl ${colors.inputBg} ${colors.border} border focus:outline-none focus:ring-2 focus:ring-opacity-50 ${colors.text} placeholder-opacity-50 font-sans`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ resize: 'none' }}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || showConfirmation}
              className={`w-full py-6 px-12 rounded-xl text-white text-xl font-medium ${colors.accentBg} ${colors.buttonHover} shadow-lg transition-all flex items-center justify-center gap-4 font-sans disabled:opacity-70 generate-summary-button mt-8`}
              whileHover={{ scale: 1.03, boxShadow: colors.buttonShadow }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FiDownload className="h-6 w-6" />
                  Generate Summary
                </>
              )}
            </motion.button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className={`mt-6 p-4 rounded-lg border-l-4 border-red-500 bg-opacity-20 ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center text-red-500 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.414-9.414a1 1 0 011.414 0L10 9.586l1.293-1.293a1 1 0 011.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {summary.length > 0 && (
              <motion.div
                className="mt-10 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={`flex-1 h-px ${colors.border} bg-opacity-50`}></div>
                  <h2 className={`text-xl font-semibold ${colors.text} flex items-center gap-2 font-sans`}>
                    <motion.span
                      animate={{ rotate: [0, 10, -5, 0] }}
                      transition={{ repeat: Infinity, repeatType: "mirror", duration: 3 }}
                    >
                      📌
                    </motion.span>
                    AI Summary
                  </h2>
                  <motion.button
                    onClick={listenToSummary}
                    className={`py-5 px-10 rounded-lg text-white text-lg font-sans ${colors.accentBg} ${colors.buttonHover} shadow-md flex items-center gap-3 listen-summary-button my-6`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <MdVolumeUp className="h-6 w-6" />
                    Listen to Summary
                  </motion.button>
                  <div className={`flex-1 h-px ${colors.border} bg-opacity-50`}></div>
                </motion.div>

                <motion.div 
                  className="grid gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {summary.map((point, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg ${colors.inputBg} border ${colors.border} shadow-sm hover:shadow-md transition-shadow relative group`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${colors.accentBg}`}></div>
                        <p className={`${colors.text} text-sm font-sans flex-1`}>{point}</p>
                        <button
                          onClick={() => copyToClipboard(point, index)}
                          className={`p-1 rounded-md ${colors.text} opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity`}
                          aria-label="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <FaCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <FaRegCopy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <WaveformAnimation darkMode={darkMode} isActive={isWaveformActive} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PodcastSummarizer;
