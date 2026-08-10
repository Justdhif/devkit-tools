'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, History, LayoutGrid } from 'lucide-react';
import { CORE_TOOLS } from '@devkit/tool-core';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Favorites', href: '/favorites', icon: Star },
    { label: 'History', href: '/history', icon: History },
    { label: 'Workspaces', href: '/workspaces', icon: LayoutGrid },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-devText-muted uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-devText-secondary hover:text-devText-primary hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-border flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-devText-muted uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Core Utilities</span>
            <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border">
              {CORE_TOOLS.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {CORE_TOOLS.map((tool) => {
              const href = `/tools/${tool.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={tool.slug}
                  href={href}
                  className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent text-white font-medium shadow-xs'
                      : 'text-devText-secondary hover:text-devText-primary hover:bg-surface'
                  }`}
                >
                  <span className="truncate">{tool.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-border text-[11px] text-devText-muted text-center">
          DevKit v1.0.0 • Client-side Privacy
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around z-40 px-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 text-[10px] ${
                isActive ? 'text-accent font-semibold' : 'text-devText-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
