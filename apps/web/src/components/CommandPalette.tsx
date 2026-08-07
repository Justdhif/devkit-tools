'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Command, Sparkles, ArrowRight } from 'lucide-react';
import { useDevKitStore } from '../store/useDevKitStore';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useDevKitStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredTools = searchTools(query);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const handleSelect = (slug: string) => {
    setCommandPaletteOpen(false);
    setQuery('');
    router.push(`/tools/${slug}`);
  };

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredTools[selectedIndex].slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDownModal}
      >
        {/* Input header */}
        <div className="flex items-center px-4 border-b border-border bg-background">
          <Search className="w-5 h-5 text-devText-muted mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a tool name, command or topic..."
            className="w-full h-14 bg-transparent text-devText-primary text-base placeholder:text-devText-muted focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded text-devText-muted hover:text-devText-primary hover:bg-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-devText-muted text-sm">
              No tools matching &quot;{query}&quot;
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.slug}
                  onClick={() => handleSelect(tool.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent text-white font-medium'
                      : 'hover:bg-background text-devText-primary'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{tool.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-sidebar border-border text-devText-muted'
                        }`}
                      >
                        {tool.category}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-devText-muted'
                      }`}
                    >
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 ml-2 ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Modal footer */}
        <div className="px-4 py-2 bg-sidebar border-t border-border flex items-center justify-between text-[11px] text-devText-muted">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded">
                ↵
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd className="font-mono bg-surface border border-border px-1 py-0.5 rounded">
                esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>DevKit Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
