'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, LogIn, Search } from 'lucide-react';
import { useDevKitStore } from '../store/useDevKitStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import { CORE_TOOLS, searchTools } from '@devkit/tool-core';
import { SearchDropdown } from './SearchDropdown';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Header() {
  const { toggleProfileDrawer, history } = useDevKitStore();
  const { user, isAuthenticated } = useAuthStore();
  const { query, setQuery } = useSearch();
  const [mounted, setMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Compute frequent / filtered tools for search dropdown
  const filteredTools = useMemo(() => {
    if (query.trim() !== '') {
      return searchTools(query).slice(0, 6);
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
  }, [query, history]);

  const handleSearchFocus = () => {
    setIsFocused(true);
    if (pathname !== '/tools') {
      router.push('/tools');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredTools.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        router.push(`/tools/${filteredTools[selectedIndex].slug}`);
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

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-4 flex items-center gap-3 sticky top-0 z-30">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 font-bold text-lg text-devText-primary tracking-tight shrink-0"
      >
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">DevKit</span>
      </Link>

      {/* Search bar — shown on all non-home pages (including /tools) */}
      <AnimatePresence>
        {!isHome && (
          <motion.div
            layoutId="devkit-search-bar"
            className="flex items-center relative flex-1 md:flex-none md:w-64 lg:w-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <Search className="w-4 h-4 absolute left-3 text-devText-muted pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-3 h-8 text-xs rounded-lg focus:border-accent"
            />

            {isFocused && (
              <SearchDropdown
                filteredTools={filteredTools}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
                onMouseEnterItem={setSelectedIndex}
                query={query}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="hidden md:block flex-1" />

      {/* Right side actions */}
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-md">
          <Shield className="w-3.5 h-3.5" />
          <span>Client Privacy First</span>
        </div>

        {mounted && isAuthenticated && user ? (
          <button
            onClick={toggleProfileDrawer}
            className="flex items-center space-x-2 p-1 pr-2.5 rounded-full border border-border bg-sidebar hover:border-accent/50 transition-colors text-xs font-semibold text-devText-primary"
            title="View Account Profile"
          >
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
              alt={user.name}
              className="w-7 h-7 rounded-full bg-background object-cover"
            />
            <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
          </button>
        ) : (
          <Button
            onClick={toggleProfileDrawer}
            size="sm"
            className="p-2 sm:px-3 sm:py-1.5"
            title="Sign In"
          >
            <LogIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
