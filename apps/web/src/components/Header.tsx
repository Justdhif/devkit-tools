'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Command, Sparkles, Shield, LogIn } from 'lucide-react';
import { useDevKitStore } from '../store/useDevKitStore';
import { useAuthStore } from '../store/useAuthStore';

export function Header() {
  const { toggleCommandPalette } = useDevKitStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        <Link href="/" className="flex items-center space-x-2 font-bold text-lg text-devText-primary tracking-tight">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className='hidden sm:inline'>DevKit</span>
        </Link>

        {/* Global Search Button / Trigger */}
        <button
          onClick={toggleCommandPalette}
          className="flex-1 max-w-md h-9 px-3 rounded-md bg-background border border-border flex items-center justify-between text-sm text-devText-muted hover:border-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-4 h-4 text-devText-muted shrink-0" />
            <span className="truncate">Search developer tools...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-devText-muted bg-surface border border-border rounded">
            <Command className="w-3 h-3" />
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-md">
          <Shield className="w-3.5 h-3.5" />
          <span>Client Privacy First</span>
        </div>

        {/* User Auth Section */}
        {mounted && isAuthenticated && user ? (
          <Link
            href="/profile"
            className="flex items-center space-x-2 p-1 pr-2 rounded-full border border-border bg-sidebar hover:border-accent/50 transition-colors text-xs font-semibold text-devText-primary"
            title="View Profile"
          >
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
              alt={user.name}
              className="w-7 h-7 rounded-full bg-background"
            />
            <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="p-2 sm:px-3 sm:py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Sign In"
          >
            <LogIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
