'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  Search,
  Star,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  X,
  Grid3x3,
} from 'lucide-react';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';
import { useDevKitStore } from '../../store/useDevKitStore';
import { useSearch } from '../../context/SearchContext';

const CATEGORIES = Array.from(new Set(CORE_TOOLS.map((t) => t.category)));

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export default function ToolsPage() {
  const router = useRouter();
  const { query, setQuery } = useSearch();
  const { toggleFavorite, isFavorite } = useDevKitStore();
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const tools = React.useMemo(() => {
    let result = searchTools(query);
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }
    return result;
  }, [query, activeCategory]);

  const popularTools = CORE_TOOLS.filter((t) => t.isPopular);
  const newTools = CORE_TOOLS.filter((t) => t.isNew);

  const handleClearSearch = () => {
    setQuery('');
    setActiveCategory(null);
    inputRef.current?.focus();
  };

  const hasFilter = query.trim() !== '' || activeCategory !== null;

  return (
    <div className="min-h-full">
      {/* Sticky search hero */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 space-y-3">
          {/* Search input */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-devText-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search all developer tools..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveCategory(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (query) {
                    handleClearSearch();
                  } else {
                    router.back();
                  }
                }
              }}
              className="w-full h-11 pl-12 pr-10 bg-surface border border-border rounded-xl text-devText-primary text-sm focus:outline-none focus:border-accent shadow-sm transition-colors placeholder:text-devText-muted"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 text-devText-muted hover:text-devText-primary transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => { setActiveCategory(null); setQuery(''); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !activeCategory && !query
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface border-border text-devText-secondary hover:text-devText-primary hover:border-accent/40'
              }`}
            >
              All ({CORE_TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = CORE_TOOLS.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(activeCategory === cat ? null : cat);
                    setQuery('');
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeCategory === cat
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface border-border text-devText-secondary hover:text-devText-primary hover:border-accent/40'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-10">
        {/* Search / filtered results */}
        {hasFilter ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-devText-primary flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" />
                {query
                  ? `Results for "${query}"`
                  : `Category: ${activeCategory}`}
              </h2>
              <span className="text-xs text-devText-muted">
                {tools.length} tool{tools.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {tools.length === 0 ? (
              <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
                <Search className="w-8 h-8 text-devText-muted mx-auto" />
                <h3 className="text-base font-semibold text-devText-primary">No tools found</h3>
                <p className="text-xs text-devText-muted">
                  No tools match &quot;{query}&quot;. Try a different keyword.
                </p>
                <button
                  onClick={handleClearSearch}
                  className="text-xs text-accent hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    favorited={isFavorite(tool.slug)}
                    onNavigate={() => router.push(`/tools/${tool.slug}`)}
                    onToggleFavorite={() => toggleFavorite(tool.slug)}
                  />
                ))}
              </motion.div>
            )}
          </section>
        ) : (
          <>
            {/* Popular tools section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-devText-primary">Popular Tools</h2>
                <span className="text-[11px] text-devText-muted ml-auto">{popularTools.length} tools</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {popularTools.map((tool) => (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    favorited={isFavorite(tool.slug)}
                    onNavigate={() => router.push(`/tools/${tool.slug}`)}
                    onToggleFavorite={() => toggleFavorite(tool.slug)}
                  />
                ))}
              </motion.div>
            </section>

            {/* New tools */}
            {newTools.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  <h2 className="text-base font-bold text-devText-primary">New & Updated</h2>
                  <span className="text-[11px] text-devText-muted ml-auto">{newTools.length} tools</span>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {newTools.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      favorited={isFavorite(tool.slug)}
                      onNavigate={() => router.push(`/tools/${tool.slug}`)}
                      onToggleFavorite={() => toggleFavorite(tool.slug)}
                    />
                  ))}
                </motion.div>
              </section>
            )}

            {/* All tools by category */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Grid3x3 className="w-4 h-4 text-devText-muted" />
                <h2 className="text-base font-bold text-devText-primary">Browse by Category</h2>
              </div>

              <div className="space-y-8">
                {CATEGORIES.map((cat) => {
                  const catTools = CORE_TOOLS.filter((t) => t.category === cat);
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-accent uppercase tracking-widest">{cat}</span>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[11px] text-devText-muted">{catTools.length} tools</span>
                      </div>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      >
                        {catTools.map((tool) => (
                          <ToolCard
                            key={tool.slug}
                            tool={tool}
                            favorited={isFavorite(tool.slug)}
                            onNavigate={() => router.push(`/tools/${tool.slug}`)}
                            onToggleFavorite={() => toggleFavorite(tool.slug)}
                          />
                        ))}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tool Card Component ──────────────────────────────────────────────────────
interface ToolCardProps {
  tool: (typeof CORE_TOOLS)[number];
  favorited: boolean;
  onNavigate: () => void;
  onToggleFavorite: () => void;
}

function ToolCard({ tool, favorited, onNavigate, onToggleFavorite }: ToolCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onNavigate}
      className="group relative p-5 bg-surface border border-border rounded-xl hover:border-accent/50 hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
    >
      {/* New badge */}
      {tool.isNew && (
        <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent uppercase tracking-widest">
          New
        </span>
      )}

      <div>
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background border border-border text-accent uppercase tracking-wider">
            {tool.category}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 text-devText-muted hover:text-amber-400 relative z-10 transition-colors"
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 transition-all ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        <h3 className="text-sm font-bold text-devText-primary mt-3 group-hover:text-accent transition-colors leading-snug">
          {tool.name}
        </h3>
        <p className="text-xs text-devText-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Client Privacy</span>
        </div>
        <span className="flex items-center space-x-1 text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
