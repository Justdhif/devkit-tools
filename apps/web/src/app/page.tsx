'use client';

import React from 'react';
import { Search, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';
import { useDevKitStore } from '../store/useDevKitStore';
import { SmartContextPanel } from '../components/SmartContextPanel';
import { useSearch } from '../context/SearchContext';
import { SearchDropdown } from '../components/SearchDropdown';

export default function HomePage() {
  const router = useRouter();
  const { query: filterQuery, setQuery: setFilterQuery } = useSearch();
  const { toggleFavorite, isFavorite, fetchFavoritesFromDB, history } = useDevKitStore();
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const displayTools = React.useMemo(() => {
    if (filterQuery.trim() !== '') {
      return searchTools(filterQuery).slice(0, 6);
    }

    // Find the most frequent tools in history
    const counts: Record<string, number> = {};
    history.forEach((item) => {
      counts[item.toolSlug] = (counts[item.toolSlug] || 0) + 1;
    });

    const sortedSlugs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    const frequentTools: typeof CORE_TOOLS = [];
    sortedSlugs.forEach((slug) => {
      const tool = CORE_TOOLS.find((t) => t.slug === slug);
      if (tool) frequentTools.push(tool);
    });

    const result = frequentTools.slice(0, 3);

    // Pad with defaults if less than 3
    if (result.length < 3) {
      const defaultSlugs = ['json-formatter', 'jwt-decoder', 'uuid-generator'];
      for (const slug of defaultSlugs) {
        if (result.length >= 3) break;
        if (!result.some((t) => t.slug === slug)) {
          const tool = CORE_TOOLS.find((t) => t.slug === slug);
          if (tool) result.push(tool);
        }
      }
    }
    return result;
  }, [filterQuery, history]);

  React.useEffect(() => {
    fetchFavoritesFromDB();
  }, [fetchFavoritesFromDB]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filterQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (displayTools.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % displayTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayTools.length) % displayTools.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayTools[selectedIndex]) {
        router.push(`/tools/${displayTools[selectedIndex].slug}`);
        setIsFocused(false);
        e.currentTarget.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsFocused(false);
      e.currentTarget.blur();
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/tools/${slug}`);
    setIsFocused(false);
  };

  const tools = searchTools(filterQuery);
  const categories = Array.from(new Set(CORE_TOOLS.map((t) => t.category)));

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center py-6 sm:py-10"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold text-devText-primary tracking-tight mb-4">

          Developer tools, all in one place.
        </h1>
        <p className="text-sm sm:text-base text-devText-secondary max-w-2xl mx-auto">
          Fast utilities for your everyday development. Zero context switching, client-side privacy, keyboard-driven navigation.
        </p>

        <div className="max-w-xl mx-auto pt-2">
          {/* layoutId matches Header mini search bar for shared animation */}
          <motion.div
            layoutId="devkit-search-bar"
            className="relative flex items-center"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <Search className="w-5 h-5 absolute left-4 text-devText-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search developer tools..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl text-devText-primary text-sm focus:outline-none focus:border-accent shadow-lg transition-colors"
            />

            {isFocused && (
              <SearchDropdown
                filteredTools={displayTools}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
                onMouseEnterItem={setSelectedIndex}
                query={filterQuery}
              />
            )}
          </motion.div>

          <SmartContextPanel input={filterQuery} className="mt-3 text-left" />
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
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
      </motion.div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-devText-primary">Tool Catalog</h2>
          <span className="text-xs text-devText-muted">
            Showing {tools.length} utility tool{tools.length !== 1 ? 's' : ''}
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {tools.map((tool) => {
            const favorited = isFavorite(tool.slug);
            return (
              <motion.div
                key={tool.slug}
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => router.push(`/tools/${tool.slug}`)}
                className="group relative p-5 bg-surface border border-border rounded-xl hover:border-accent/50 hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-background border border-border text-accent uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.slug);
                      }}
                      className="p-1 text-devText-muted hover:text-amber-400 relative z-10"
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
                  <span className="flex items-center space-x-1 text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
