'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useDevKitStore } from '../../store/useDevKitStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Input, Textarea } from '../ui/input';
import { Card, CardHeader } from '../ui/card';

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

  const { addHistoryItem } = useDevKitStore();

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    let finalUrl = url.trim();
    const activeParams = params.filter((p) => p.enabled && p.key.trim());
    if (activeParams.length > 0) {
      const searchParams = new URLSearchParams();
      activeParams.forEach((p) => searchParams.append(p.key.trim(), p.value.trim()));
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const reqHeaders: Record<string, string> = {};
    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      reqHeaders[h.key.trim()] = h.value.trim();
    });
    if (authToken.trim()) {
      reqHeaders['Authorization'] = `Bearer ${authToken.trim()}`;
    }

    try {
      if (useProxy) {
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
        addHistoryItem('api-tester', `${method} ${url.trim()} — ${json.data?.status ?? 'OK'}`);
      } else {
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
        addHistoryItem('api-tester', `${method} ${url.trim()} — ${directRes.status} ${directRes.statusText}`);
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
      <div className="flex flex-wrap items-center gap-2 bg-surface p-3 rounded-xl border border-border">
        <Select value={method} onValueChange={(val: any) => setMethod(val)}>
          <SelectTrigger className="w-24 font-mono font-bold text-accent">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 min-w-[280px] h-9 text-xs"
        />

        <Button
          onClick={handleSendRequest}
          disabled={loading || !url.trim()}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </Button>

        <Button
          onClick={handleShareConfig}
          variant="secondary"
          title="Share request config"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </Button>
      </div>

      {shareUrl && (
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs text-accent flex items-center justify-between">
          <span>Share Link Copied to Clipboard: <strong>{shareUrl}</strong></span>
          <Button onClick={() => setShareUrl(null)} variant="ghost" size="sm" className="h-auto p-0 text-accent hover:underline">
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs bg-sidebar px-3 py-2 rounded-lg border border-border">
        <div className="flex items-center space-x-1 border-b border-border">
          {(['params', 'headers', ...((['POST', 'PUT', 'PATCH'].includes(method) ? ['body'] : [])), 'auth'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === 'params' ? `Params (${params.filter((p) => p.enabled && p.key).length})`
              : tab === 'headers' ? `Headers (${headers.filter((h) => h.enabled && h.key).length})`
              : tab === 'body' ? 'Body'
              : 'Auth';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1 font-medium transition-colors ${
                  isActive ? 'text-accent font-semibold' : 'text-devText-muted hover:text-devText-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="apiTabPill"
                    className="absolute inset-0 border-b-2 border-accent rounded-t-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center space-x-1.5 cursor-pointer text-devText-secondary hover:text-devText-primary">
          <Checkbox
            checked={useProxy}
            onCheckedChange={(val) => setUseProxy(val === true)}
          />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SSRF Security Proxy</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <Card className="p-3 space-y-3">
          {activeTab === 'params' && (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {params.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={p.enabled}
                    onCheckedChange={(val) => {
                      const copy = [...params];
                      copy[idx].enabled = val === true;
                      setParams(copy);
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="Key"
                    value={p.key}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].key = e.target.value;
                      setParams(copy);
                    }}
                    className="flex-1 h-7 text-xs"
                  />
                  <Input
                    type="text"
                    placeholder="Value"
                    value={p.value}
                    onChange={(e) => {
                      const copy = [...params];
                      copy[idx].value = e.target.value;
                      setParams(copy);
                    }}
                    className="flex-1 h-7 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setParams(params.filter((_, i) => i !== idx))}
                    className="h-7 w-7 text-devText-muted hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="link"
                size="sm"
                onClick={() => setParams([...params, { key: '', value: '', enabled: true }])}
                className="pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Query Parameter</span>
              </Button>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {headers.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={h.enabled}
                    onCheckedChange={(val) => {
                      const copy = [...headers];
                      copy[idx].enabled = val === true;
                      setHeaders(copy);
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="Header Name"
                    value={h.key}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].key = e.target.value;
                      setHeaders(copy);
                    }}
                    className="flex-1 h-7 text-xs"
                  />
                  <Input
                    type="text"
                    placeholder="Header Value"
                    value={h.value}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[idx].value = e.target.value;
                      setHeaders(copy);
                    }}
                    className="flex-1 h-7 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setHeaders(headers.filter((_, i) => i !== idx))}
                    className="h-7 w-7 text-devText-muted hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="link"
                size="sm"
                onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                className="pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </Button>
            </div>
          )}

          {activeTab === 'body' && (
            <Textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter JSON or raw payload..."
              className="flex-1 min-h-[220px]"
            />
          )}

          {activeTab === 'auth' && (
            <div className="space-y-3 p-1">
              <div>
                <label className="text-xs font-semibold text-devText-muted block mb-1">
                  Bearer Token Authentication
                </label>
                <Input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Paste Bearer token secret here..."
                  className="h-9"
                />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyResponse}
                  className="h-auto p-0 hover:bg-transparent text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            )}
          </CardHeader>

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
        </Card>
      </div>
    </div>
  );
}
