'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, LogIn, Search } from 'lucide-react';
import { useDevKitStore } from '../store/useDevKitStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Header() {
  const { toggleProfileDrawer } = useDevKitStore();
  const { user, isAuthenticated } = useAuthStore();
  const { query, setQuery } = useSearch();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isToolsPage = pathname === '/tools';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchFocus = () => {
    // Navigate ke halaman catalog tools saat search di-klik
    router.push('/tools');
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

      {/* Search bar — hidden on home page and /tools page (both have their own search). */}
      <AnimatePresence>
        {!isHome && !isToolsPage && (
          <motion.div
            layoutId="devkit-search-bar"
            className="flex items-center relative flex-1 md:flex-none md:w-56 lg:w-72"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <Search className="w-4 h-4 absolute left-3 text-devText-muted pointer-events-none" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSearchFocus}
              readOnly
              className="pl-9 pr-3 h-8 text-xs rounded-lg cursor-pointer"
            />
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
