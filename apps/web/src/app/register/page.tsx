'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, UserPlus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password !== confirmPassword) {
      setLocalErr('Passwords do not match.');
      return;
    }
    setLocalErr(null);

    const success = await register(name, email, password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white mx-auto shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-devText-primary tracking-tight">Create DevKit Account</h1>
          <p className="text-xs text-devText-secondary">Unlock cloud sync for history, favorites & workspaces</p>
        </div>

        {(error || localErr) && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || localErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-devText-muted block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Alex Developer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-devText-muted block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-devText-muted block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-devText-muted block mb-1">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border text-xs text-devText-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
