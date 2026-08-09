'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase 1: Animate progress bar simulating loading assets
    const duration = 1000; // 1 second loader
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Phase 2: Fade out the loader screen after a small delay
          setTimeout(() => {
            setLoading(false);
          }, 200);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.4, ease: 'easeInOut' }
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B] text-white"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] sm:w-[500px] sm:h-[500px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex flex-col items-center z-10"
          >
            {/* Pulsing Branded Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -6, 0]
              }}
              transition={{
                scale: { duration: 0.5, ease: 'easeOut' },
                opacity: { duration: 0.5 },
                y: {
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'easeInOut'
                }
              }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            {/* Title / Brand Name */}
            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-1"
            >
              DevKit
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-8"
            >
              The developer's toolbox
            </motion.p>

            {/* Progress Bar Container */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="w-48 h-1 bg-zinc-800/80 rounded-full overflow-hidden relative"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </motion.div>

            {/* Optional Small Status Text */}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-zinc-500 mt-2 font-mono"
            >
              Initializing modules... {Math.round(progress)}%
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
