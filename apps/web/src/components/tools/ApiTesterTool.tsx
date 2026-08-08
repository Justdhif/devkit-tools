'use client';

import React, { useState } from 'react';
import {
  Globe,
  Send,
  Loader2,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { ApiProxyResponse } from '@devkit/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type TabType = 'params' | 'headers' | 'body' | 'auth';

interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export function ApiTesterTool({ initialConfig }: { initialConfig?: any }) {
  const [url, setUrl] = useState(initialConfig?.url || 'https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState<HttpMethod>(initialConfig?.method || 'GET');
  const [activeTab, setActiveTab] = useState<TabType>('params');

  const [params, setParams] = useState<KeyValuePair[]>(initialConfig?.params || [{ key: '', value: '', enabled: true }]);
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    initialConfig?.headers || [
      { key: 'Accept', value: 'application/json', enabled: true },
      { key: 'User-Agent', value: 'DevKit-Tools/1.0', enabled: true },
    ]
  );
  const [bodyText, setBodyText] = useState(initialConfig?.bodyText || '{\n  "title": "New DevKit Task",\n  "completed": false\n}');
  const [authToken, setAuthToken] = useState(initialConfig?.authToken || '');

  const [useProxy, setUseProxy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiProxyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    // Build URL with query params
    let finalUrl = url.trim();
    const activeParams = params.filter((p) => p.enabled && p.key.trim());
    if (activeParams.length > 0) {
      const searchParams = new URLSearchParams();
      activeParams.forEach((p) => searchParams.append(p.key.trim(), p.value.trim()));
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
    }

    // Build Headers
    const reqHeaders: Record<string, string> = {};
    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      reqHeaders[h.key.trim()] = h.value.trim();
    });
    if (authToken.trim()) {
      reqHeaders['Authorization'] = `Bearer ${authToken.trim()}`;
    }

    try {
      if (useProxy) {
        // Send via NestJS SSRF-protected proxy
        const res = await fetch(`${API_BASE_URL}/tools/proxy-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: finalUrl,
            method,
            headers: reqHeaders,
            body: ['POST', 'PUT', 'PATCH'].includes(method) ? bodyText : undefined,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || json.error || 'Proxy request failed');
        }
        setResponse(json.data);
      } else {
        // Direct browser fetch
        const start = Date.now();
        const fetchOptions: RequestInit = {
          method,
          headers: reqHeaders,
        };
        if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText) {
          fetchOptions.body = bodyText;
        }

        const directRes = await fetch(finalUrl, fetchOptions);
        const timeMs = Date.now() - start;
        const text = await directRes.text();

        let data: any = text;
        try {
          data = JSON.parse(text);
        } catch {}

        const resHeaders: Record<string, string> = {};
        directRes.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        setResponse({
          status: directRes.status,
          statusText: directRes.statusText,
          headers: resHeaders,
          data,
          responseTimeMs: timeMs,
          sizeBytes: new Blob([text]).size,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute HTTP request');
    } finally {
      setLoading(false);
    }
  };

  const handleShareConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: 'api-tester',
          title: `API Request: ${method} ${url.substring(0, 30)}`,
          configuration: {
            url,
            method,
            params,
            headers: headers.filter((h) => !h.key.toLowerCase().includes('auth')),
            bodyText,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        const fullUrl = `${window.location.origin}${json.shareUrl}`;
        setShareUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyResponse = () => {
    if (!response) return;
    const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Request Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-surface p-3 rounded-xl border border-border">
        <select
          value={method}
          onChange={(e: any) => setMethod(e.target.value)}
          className="bg-background border border-border text-accent font-mono font-bold text-xs rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 min-w-[280px] bg-background border border-border text-devText-primary font-mono text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />

        <button
          onClick={handleSendRequest}
          disabled={loading || !url.trim()}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>

        <button
          onClick={handleShareConfig}
          className="px-3 py-2 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors shrink-0"
          title="Share request config"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {shareUrl && (
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent flex items-center justify-between">
          <span>Share Link Copied to Clipboard: <strong>{shareUrl}</strong></span>
          <button onClick={() => setShareUrl(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Request Options & Proxy Settings */}
      <div className="flex items-center justify-between text-xs bg-sidebar px-3 py-2 rounded-lg border border-border">
        <div className="flex items-center space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab('params')}
            className={`px-3 py-1 font-medium transition-colors border-b-2 ${
              activeTab === 'params' ? 'border-accent text-accent' : 'border-transparent text-devText-muted'
            }`}
          >
            Params ({params.filter((p) => p.enabled && p.key).length})
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1 font-medium transition-colors border-b-2 ${
              activeTab === 'headers' ? 'border-accent text-accent' : 'border-transparent text-devText-muted'
            }`}
          >
            Headers ({headers.filter((h) => h.enabled && h.key).length})
          </button>
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <button
              onClick={() => setActiveTab('body')}
              className={`px-3 py-1 font-medium transition-colors border-b-2 ${
                activeTab === 'body' ? 'border-accent text-accent' : 'border-transparent text-devText-muted'
              }`}
            >
              Body
            </button>
          )}
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-1 font-medium transition-colors border-b-2 ${
              activeTab === 'auth' ? 'border-accent text-accent' : 'border-transparent text-devText-muted'
            }`}
          >
            Auth
          </button>
        </div>

        <label className="flex items-center space-x-1.5 cursor-pointer text-devText-secondary hover:text-devText-primary">
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            className="accent-accent"
          />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SSRF Security Proxy</span>
        </label>
      </div>

      {/* Main Grid: Request Config & Response Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Request Configuration Panel */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden p-3 space-y-3">
          {activeTab === 'params' && (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {params.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].enabled = e.target.checked;
                      setParams(copy);
                    }}
                    className="accent-accent"
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={p.key}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].key = e.target.value;
                      setParams(copy);
                    }}
                    className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono text-devText-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={p.value}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].value = e.target.value;
                      setParams(copy);
                    }}
                    className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono text-devText-primary focus:outline-none"
                  />
                  <button
                    onClick={() => setParams(params.filter((_, i) => i !== idx))}
                    className="text-devText-muted hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setParams([...params, { key: '', value: '', enabled: true }])}
                className="text-xs text-accent flex items-center space-x-1 hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Query Parameter</span>
              </button>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {headers.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].enabled = e.target.checked;
                      setHeaders(copy);
                    }}
                    className="accent-accent"
                  />
                  <input
                    type="text"
                    placeholder="Header Name"
                    value={h.key}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].key = e.target.value;
                      setHeaders(copy);
                    }}
                    className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono text-devText-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Header Value"
                    value={h.value}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].value = e.target.value;
                      setHeaders(copy);
                    }}
                    className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono text-devText-primary focus:outline-none"
                  />
                  <button
                    onClick={() => setHeaders(headers.filter((_, i) => i !== idx))}
                    className="text-devText-muted hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                className="text-xs text-accent flex items-center space-x-1 hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter JSON or raw payload..."
              className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
            />
          )}

          {activeTab === 'auth' && (
            <div className="space-y-3 p-1">
              <div>
                <label className="text-xs font-semibold text-devText-muted block mb-1">
                  Bearer Token Authentication
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Paste Bearer token secret here..."
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono text-devText-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Response Panel */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>RESPONSE INSPECTOR</span>
            {response && (
              <div className="flex items-center space-x-3 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    response.status < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {response.status} {response.statusText || 'OK'}
                </span>
                <span className="text-devText-secondary">{response.responseTimeMs} ms</span>
                <span className="text-devText-secondary">{(response.sizeBytes / 1024).toFixed(1)} KB</span>
                <button
                  onClick={handleCopyResponse}
                  className="hover:text-devText-primary text-xs flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto font-mono text-xs">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!response && !error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-devText-muted text-center p-6 space-y-2">
                <Globe className="w-8 h-8 opacity-40 text-accent" />
                <p>Click &quot;Send&quot; above to execute request.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-devText-muted text-center p-6 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <p>Sending request...</p>
              </div>
            )}

            {response && (
              <pre className="text-devText-primary whitespace-pre-wrap">
                {typeof response.data === 'string'
                  ? response.data
                  : JSON.stringify(response.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
