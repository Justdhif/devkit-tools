'use client';

import React from 'react';
import { User, LogOut, Shield, Key, Mail, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthGuard } from '../../components/AuthGuard';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  return (
    <AuthGuard title="User Profile" description="Sign in to manage your account details and connected sessions.">
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-devText-primary">User Profile</h1>
            <p className="text-xs text-devText-secondary">Account information & session management</p>
          </div>
        </div>

        {user && (
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-border">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-accent p-0.5 bg-sidebar"
              />
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl font-bold text-devText-primary">{user.name}</h2>
                <div className="flex items-center space-x-2 text-xs text-devText-muted justify-center sm:justify-start">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Authenticated Account</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-background border border-border space-y-1">
                <span className="text-devText-muted block font-medium">User ID</span>
                <span className="font-mono text-devText-primary font-bold">{user.id}</span>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border space-y-1">
                <span className="text-devText-muted block font-medium">Account Security</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Encrypted Password Session</span>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={logout}
                className="px-4 py-2 bg-rose-950/50 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
