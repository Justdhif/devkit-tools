'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogIn, AlertCircle, Github, Chrome } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginOAuth, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
  };

  const handleOAuthClick = (provider: 'github' | 'google') => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liDevKitClientId';
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'DevKitGoogleClientId';

    if (provider === 'github') {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback?provider=github`);
      // Redirects directly to GitHub's official OAuth Authorization page
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
      return;
    }

    if (provider === 'google') {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback?provider=google`);
      // Redirects directly to Google's official OAuth Account Consent page
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;
      return;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white mx-auto shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-devText-primary tracking-tight">Welcome Back</h1>
          <p className="text-xs text-devText-secondary">Sign in to your DevKit workspace account</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-devText-muted">Password</label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-devText-primary focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border w-full"></div>
          <span className="bg-surface px-2 text-[10px] text-devText-muted uppercase tracking-wider absolute">
            Or Continue With
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthClick('github')}
            className="p-2.5 bg-background border border-border rounded-lg text-xs font-medium text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthClick('google')}
            className="p-2.5 bg-background border border-border rounded-lg text-xs font-medium text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-accent" />
            <span>Google</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-border text-xs text-devText-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
