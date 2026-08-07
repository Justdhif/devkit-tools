'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Star, ShieldCheck, ArrowRight, Wrench, Command } from 'lucide-react';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';
import { useDevKitStore } from '../store/useDevKitStore';

export default function HomePage() {
  const [filterQuery, setFilterQuery] = useState('');
  const { toggleFavorite, isFavorite, toggleCommandPalette, fetchFavoritesFromDB } = useDevKitStore();

  React.useEffect(() => {
    fetchFavoritesFromDB();
  }, [fetchFavoritesFromDB]);

  const tools = searchTools(filterQuery);

  const categories = Array.from(new Set(CORE_TOOLS.map((t) => t.category)));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* HERO SECTION */}
      <section className="text-center py-6 sm:py-10 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Developer&apos;s Everyday Toolbox</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-devText-primary tracking-tight">
          Developer tools, <span className="text-accent">all in one place.</span>
        </h1>
        <p className="text-sm sm:text-base text-devText-secondary max-w-2xl mx-auto">
          Fast utilities for your everyday development. Zero context switching, client-side privacy, keyboard-driven navigation.
        </p>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-devText-muted" />
            <input
              type="text"
              placeholder="Search developer tools... ⌘K"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-24 bg-surface border border-border rounded-xl text-devText-primary text-sm focus:outline-none focus:border-accent shadow-lg transition-colors"
            />
            <button
              onClick={toggleCommandPalette}
              className="absolute right-3 px-2.5 py-1 text-xs font-mono bg-background border border-border rounded-md text-devText-muted hover:text-devText-primary flex items-center space-x-1"
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </button>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY TAGS */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setFilterQuery('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            filterQuery === ''
              ? 'bg-accent text-white border-accent'
              : 'bg-surface border-border text-devText-secondary hover:text-devText-primary'
          }`}
        >
          All Tools ({CORE_TOOLS.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterQuery(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterQuery.toLowerCase() === cat.toLowerCase()
                ? 'bg-accent text-white border-accent'
                : 'bg-surface border-border text-devText-secondary hover:text-devText-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TOOL GRID CATALOG */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-devText-primary">Tool Catalog</h2>
          <span className="text-xs text-devText-muted">
            Showing {tools.length} utility tool{tools.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const favorited = isFavorite(tool.slug);
            return (
              <div
                key={tool.slug}
                className="group relative p-5 bg-surface border border-border rounded-xl hover:border-accent/50 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background border border-border text-accent uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(tool.slug);
                      }}
                      className="p-1 text-devText-muted hover:text-amber-400"
                    >
                      <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-devText-primary mt-3 group-hover:text-accent transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-devText-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Client Privacy</span>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="flex items-center space-x-1 text-accent font-semibold group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
