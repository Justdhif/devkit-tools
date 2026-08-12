'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Search, Star, ShieldCheck, ArrowRight, Wrench } from 'lucide-react';
import { searchTools } from '@devkit/tool-core';
import { useDevKitStore } from '../../store/useDevKitStore';
import { useSearch } from '../../context/SearchContext';

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

  const tools = React.useMemo(() => {
    return searchTools(query);
  }, [query]);

  const isFiltering = query.trim() !== '';

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-devText-primary">Developer Tools</h1>
            <p className="text-xs text-devText-secondary">
              {isFiltering
                ? `Showing search results for "${query}"`
                : 'All productivity utilities and developer tools'}
            </p>
          </div>
        </div>

        <span className="text-xs text-devText-muted font-medium">
          Showing {tools.length} utility tool{tools.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Single Grid Catalog */}
      <section className="space-y-4">
        {tools.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-3">
            <Search className="w-8 h-8 text-devText-muted mx-auto" />
            <h3 className="text-base font-semibold text-devText-primary">No tools found</h3>
            <p className="text-xs text-devText-muted">
              No tools match &quot;{query}&quot;. Try typing a different keyword in the header search.
            </p>
            <button
              onClick={() => setQuery('')}
              className="text-xs text-accent hover:underline font-semibold"
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
                        className="p-1 text-devText-muted hover:text-amber-400 relative z-10 transition-colors"
                        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 transition-all ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
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
        )}
      </section>
    </div>
  );
}
