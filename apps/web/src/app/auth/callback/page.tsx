"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const provider = searchParams.get("provider") || "github";

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code was returned by the provider.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback?provider=${provider}`;
        const res = await fetch(`${API_BASE_URL}/auth/oauth/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, code, redirectUri }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          useAuthStore.setState({
            user: data.user,
            token: data.accessToken || data.token,
            refreshToken: data.refreshToken || null,
            isAuthenticated: true,
          });
          router.push("/");
        } else {
          setStatus("error");
          setErrorMsg(data.message || "Failed to exchange authorization code.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg("Network error while verifying OAuth callback.");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 text-center space-y-4 shadow-2xl">
      {status === "loading" ? (
        <div className="space-y-3 py-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-devText-primary">
            Authorizing Account...
          </h2>
          <p className="text-xs text-devText-secondary font-mono">
            Exchanging OAuth authorization credentials...
          </p>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-devText-primary">
            Authorization Error
          </h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 text-center py-12 shadow-2xl">
            <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
