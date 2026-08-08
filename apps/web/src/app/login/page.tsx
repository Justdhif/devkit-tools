'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, AlertCircle, Github, Chrome, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { loginOAuth, isLoading, error } = useAuthStore();

  const handleOAuthClick = async (provider: 'github' | 'google') => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (provider === 'github') {
      if (githubClientId && githubClientId.trim() !== '') {
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback?provider=github`);
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId.trim()}&redirect_uri=${redirectUri}&scope=user:email`;
        return;
      }
      const ok = await loginOAuth('github');
      if (ok) router.push('/');
      return;
    }

    if (provider === 'google') {
      if (googleClientId && googleClientId.trim() !== '') {
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback?provider=google`);
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId.trim()}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;
        return;
      }
      const ok = await loginOAuth('google');
      if (ok) router.push('/');
      return;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-devText-primary tracking-tight">Sign In to DevKit</h1>
          <p className="text-xs text-devText-secondary max-w-xs mx-auto">
            Choose your preferred OAuth provider to sync your developer tools, history & workspaces
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthClick('github')}
            className="w-full py-3 px-4 bg-background border border-border rounded-xl text-xs font-semibold text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-3 transition-colors shadow-xs disabled:opacity-50 group"
          >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Continue with GitHub</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthClick('google')}
            className="w-full py-3 px-4 bg-background border border-border rounded-xl text-xs font-semibold text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-3 transition-colors shadow-xs disabled:opacity-50 group"
          >
            <Chrome className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="pt-4 border-t border-border text-[11px] text-devText-muted flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero passwords to remember. Instant client-side privacy.</span>
        </div>
      </div>
    </div>
  );
}
