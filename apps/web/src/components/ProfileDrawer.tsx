"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  LogOut,
  Github,
  Chrome,
  ShieldCheck,
  Star,
  History,
  LayoutGrid,
  User,
} from "lucide-react";
import { useDevKitStore } from "../store/useDevKitStore";
import { useAuthStore } from "../store/useAuthStore";

export function ProfileDrawer() {
  const {
    isProfileDrawerOpen,
    setProfileDrawerOpen,
    favorites,
    history,
    workspaces,
  } = useDevKitStore();
  const { user, isAuthenticated, logout, loginOAuth, isLoading, error } =
    useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProfileDrawerOpen) {
        setProfileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileDrawerOpen, setProfileDrawerOpen]);

  const handleOAuthClick = async (provider: "github" | "google") => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (provider === "github") {
      if (githubClientId && githubClientId.trim() !== "") {
        const redirectUri = encodeURIComponent(
          `${window.location.origin}/auth/callback?provider=github`,
        );
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId.trim()}&redirect_uri=${redirectUri}&scope=user:email`;
        return;
      }
      const ok = await loginOAuth("github");
      if (ok) setProfileDrawerOpen(false);
      return;
    }

    if (provider === "google") {
      if (googleClientId && googleClientId.trim() !== "") {
        const redirectUri = encodeURIComponent(
          `${window.location.origin}/auth/callback?provider=google`,
        );
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId.trim()}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;
        return;
      }
      const ok = await loginOAuth("google");
      if (ok) setProfileDrawerOpen(false);
      return;
    }
  };

  return (
    <AnimatePresence>
      {isProfileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-devText-primary">
                    {isAuthenticated && user
                      ? "Account Profile"
                      : "Sign In to DevKit"}
                  </h2>
                </div>
                <button
                  onClick={() => setProfileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-devText-muted hover:text-devText-primary hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Logged-In User Profile State */}
              {isAuthenticated && user ? (
                <div className="space-y-6">
                  {/* Avatar & User Details */}
                  <div className="flex flex-col items-center text-center space-y-3 p-4 bg-background border border-border rounded-xl">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`
                      }
                      alt={user.name}
                      className="w-20 h-20 rounded-full border-2 border-accent shadow-md bg-surface object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-extrabold text-devText-primary">
                        {user.name}
                      </h3>
                      <p className="text-xs text-devText-secondary font-mono mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] font-semibold text-devText-muted">
                      {user.provider === "github" ? (
                        <>
                          <Github className="w-3.5 h-3.5 text-white" />
                          <span>Signed in via GitHub</span>
                        </>
                      ) : (
                        <>
                          <Chrome className="w-3.5 h-3.5 text-accent" />
                          <span>Signed in via Google</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Account Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-background border border-border rounded-xl text-center">
                      <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-devText-primary">
                        {favorites.length}
                      </div>
                      <div className="text-[10px] text-devText-muted">
                        Starred
                      </div>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl text-center">
                      <History className="w-4 h-4 text-accent mx-auto mb-1" />
                      <div className="text-sm font-bold text-devText-primary">
                        {history.length}
                      </div>
                      <div className="text-[10px] text-devText-muted">
                        History
                      </div>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl text-center">
                      <LayoutGrid className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-devText-primary">
                        {workspaces.length}
                      </div>
                      <div className="text-[10px] text-devText-muted">
                        Workspaces
                      </div>
                    </div>
                  </div>

                  {/* Session Status Banner */}
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>JWT Cycle Active:</strong> Session automatically
                      refreshes in background without expiration.
                    </span>
                  </div>
                </div>
              ) : (
                /* Unauthenticated / Guest OAuth Sign-In Panel */
                <div className="space-y-6">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white mx-auto shadow-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-devText-primary">
                      Welcome to DevKit
                    </h3>
                    <p className="text-xs text-devText-secondary max-w-xs mx-auto">
                      Sign in with your preferred OAuth account to sync your
                      starred tools, history & workspaces across devices.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                      <X className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleOAuthClick("github")}
                      className="flex-1 py-3 px-1.5 bg-background border border-border/80 hover:border-accent/60 rounded-xl text-sm font-bold text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 group"
                    >
                      <Github className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">GitHub</span>
                    </button>

                    <span className="text-2xl sm:text-3xl font-extrabold leading-none text-devText-secondary px-1 lowercase shrink-0 select-none">
                      or
                    </span>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleOAuthClick("google")}
                      className="flex-1 py-3 px-1.5 bg-background border border-border/80 hover:border-accent/60 rounded-xl text-sm font-bold text-devText-primary hover:bg-sidebar flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 group"
                    >
                      <Chrome className="w-5 h-5 text-accent group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">Google</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-border mt-6">
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    logout();
                    setProfileDrawerOpen(false);
                  }}
                  className="w-full py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              ) : (
                <div className="text-center text-[11px] text-devText-muted flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Client-side privacy guaranteed. Zero passwords saved.
                  </span>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
