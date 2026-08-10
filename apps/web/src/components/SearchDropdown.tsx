'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ToolMetadata } from '@devkit/shared';

interface SearchDropdownProps {
  filteredTools: ToolMetadata[];
  selectedIndex: number;
  onSelect: (slug: string) => void;
  onMouseEnterItem: (index: number) => void;
  query: string;
}

export function SearchDropdown({
  filteredTools,
  selectedIndex,
  onSelect,
  onMouseEnterItem,
  query,
}: SearchDropdownProps) {
  if (filteredTools.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden p-4 text-center text-devText-muted text-xs">
        No tools matching &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[320px]">
      {query.trim() === '' && (
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-accent uppercase tracking-wider bg-background/50">
          Frequently Opened Tools
        </div>
      )}
      <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 custom-scrollbar">
        {filteredTools.map((tool, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={tool.slug}
              onMouseDown={(e) => {
                // Prevent input blur before click registers
                e.preventDefault();
                onSelect(tool.slug);
              }}
              onMouseEnter={() => onMouseEnterItem(idx)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-accent text-white font-medium'
                  : 'hover:bg-background text-devText-primary'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold truncate">{tool.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border shrink-0 ${
                      isSelected
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-sidebar border-border text-devText-muted'
                    }`}
                  >
                    {tool.category}
                  </span>
                </div>
                <p
                  className={`text-[10px] mt-0.5 truncate ${
                    isSelected ? 'text-white/80' : 'text-devText-muted'
                  }`}
                >
                  {tool.description}
                </p>
              </div>
              <ArrowRight
                className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                  isSelected ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer shortcut bar */}
      <div className="px-3 py-1.5 bg-sidebar border-t border-border flex items-center justify-between text-[10px] text-devText-muted shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <span>
            <kbd className="font-mono bg-surface border border-border px-1 py-0.2 rounded">
              ↑↓
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd className="font-mono bg-surface border border-border px-1 py-0.2 rounded">
              ↵
            </kbd>{' '}
            Select
          </span>
          <span>
            <kbd className="font-mono bg-surface border border-border px-1 py-0.2 rounded">
              esc
            </kbd>{' '}
            Close
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-1">
          <Sparkles className="w-2.5 h-2.5 text-accent" />
          <span>DevKit Search</span>
        </div>
      </div>
    </div>
  );
}
