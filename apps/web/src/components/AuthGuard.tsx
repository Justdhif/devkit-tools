'use client';

import React from 'react';
import { Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDevKitStore } from '../store/useDevKitStore';

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthGuard({
  children,
  title = 'Authentication Required',
  description = 'Sign in with GitHub or Google to synchronize your favorites, tool history, and personal workspaces.',
}: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const { toggleProfileDrawer } = useDevKitStore();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="p-4 sm:p-12 max-w-xl mx-auto my-8">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-devText-primary">{title}</h2>
          <p className="text-xs sm:text-sm text-devText-secondary max-w-sm mx-auto">{description}</p>
        </div>

        <div className="p-3 bg-sidebar border border-border rounded-lg text-xs text-devText-muted flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Basic developer tools remain 100% free & usable as a guest without logging in.</span>
        </div>

        <div className="flex items-center justify-center pt-2">
          <button
            onClick={toggleProfileDrawer}
            className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with OAuth</span>
          </button>
        </div>
      </div>
    </div>
  );
}
