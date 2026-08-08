'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Terminal, ArrowLeft, Code2, ShieldAlert } from 'lucide-react';
import { useDevKitStore } from '../store/useDevKitStore';

export default function NotFound() {
  const { toggleCommandPalette } = useDevKitStore();

  const quickTools = [
    { slug: 'json-formatter', name: 'JSON Formatter', desc: 'Prettify & validate JSON data' },
    { slug: 'jwt-decoder', name: 'JWT Decoder', desc: 'Inspect token headers & claims' },
    { slug: 'hash-generator', name: 'Hash Generator', desc: 'MD5, SHA-256, SHA-512 hashes' },
    { slug: 'regex-tester', name: 'Regex Tester', desc: 'Test regular expressions live' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl space-y-8 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 High-Tech Badge */}
        <div className="space-y-3 relative z-10">
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-emerald-400 tracking-tight font-mono">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-extrabold text-devText-primary tracking-tight">
            Lost in Code Space?
          </h2>
          <p className="text-xs sm:text-sm text-devText-secondary max-w-md mx-auto leading-relaxed">
            The developer utility or page you requested could not be found. It may have been renamed, moved, or deleted.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Catalog</span>
          </Link>

          <button
            onClick={toggleCommandPalette}
            className="w-full sm:w-auto px-6 py-3 bg-background border border-border text-devText-primary hover:bg-sidebar hover:border-accent/40 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <Search className="w-4 h-4 text-accent" />
            <span>Search Utilities (⌘K)</span>
          </button>
        </div>

        {/* Popular Utilities Quick Navigation */}
        <div className="pt-6 border-t border-border/80 text-left space-y-3 relative z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-devText-muted">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Or jump straight to popular developer utilities:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="p-3 bg-background border border-border/60 hover:border-accent/40 rounded-xl transition-all flex items-start space-x-3 group"
              >
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-accent shrink-0 group-hover:scale-105 transition-transform">
                  <Code2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-devText-primary group-hover:text-accent transition-colors truncate">
                    {tool.name}
                  </div>
                  <div className="text-[11px] text-devText-muted truncate">{tool.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
