'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Copy, Check, Send, Sparkles } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { PostExecutionRecommendations } from '../PostExecutionRecommendations';

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com", "role": "admin"}'`;

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export function CurlConverterTool() {
  const router = useRouter();
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'php'>('fetch');
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  // Parse cURL command
  const parsedCurl = useMemo<ParsedCurl>(() => {
    const raw = curlInput.trim().replace(/\\\n/g, ' ');
    if (!raw) {
      return { url: '', method: 'GET', headers: {}, body: '' };
    }

    let url = 'https://api.example.com';
    let method = 'GET';
    const headers: Record<string, string> = {};
    let body = '';

    // Extract URL
    const urlMatch = raw.match(/curl\s+(?:-[A-Za-z0-9]+\s+)*['"]?(https?:\/\/[^\s'"]+)['"]?/i);
    if (urlMatch) {
      url = urlMatch[1];
    }

    // Extract Method
    const methodMatch = raw.match(/-X\s+([A-Z]+)/i) || raw.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (raw.includes('-d ') || raw.includes('--data ') || raw.includes('--data-raw ')) {
      method = 'POST';
    }

    // Extract Headers
    const headerMatches = Array.from(raw.matchAll(/-H\s+['"]([^'"]+)['"]/gi)).concat(
      Array.from(raw.matchAll(/--header\s+['"]([^'"]+)['"]/gi))
    );
    for (const match of headerMatches) {
      const headerStr = match[1];
      const colonIdx = headerStr.indexOf(':');
      if (colonIdx > 0) {
        const key = headerStr.substring(0, colonIdx).trim();
        const val = headerStr.substring(colonIdx + 1).trim();
        headers[key] = val;
      }
    }

    // Extract Body
    const bodyMatch =
      raw.match(/-d\s+['"]([\s\S]*?)['"](?:\s+|$)/) ||
      raw.match(/--data\s+['"]([\s\S]*?)['"](?:\s+|$)/) ||
      raw.match(/--data-raw\s+['"]([\s\S]*?)['"](?:\s+|$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
    }

    return { url, method, headers, body };
  }, [curlInput]);

  // Code generator
  const generatedCode = useMemo(() => {
    const { url, method, headers, body } = parsedCurl;
    if (!url) return '// Enter a valid cURL command above';

    if (targetLang === 'fetch') {
      return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4)},
  ${['POST', 'PUT', 'PATCH'].includes(method) && body ? `body: ${JSON.stringify(body)}` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    }

    if (targetLang === 'axios') {
      return `import axios from 'axios';

axios({
  url: "${url}",
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4)},
  ${['POST', 'PUT', 'PATCH'].includes(method) && body ? `data: ${body}` : ''}
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
    }

    if (targetLang === 'python') {
      const headerDict = Object.entries(headers)
        .map(([k, v]) => `    "${k}": "${v}"`)
        .join(',\n');
      return `import requests

url = "${url}"
headers = {
${headerDict}
}
${body ? `data = ${JSON.stringify(body)}` : ''}

response = requests.request("${method}", url, headers=headers${body ? ', data=data' : ''})
print(response.json())`;
    }

    if (targetLang === 'go') {
      return `package main

import (
    "fmt"
    "net/http"
    ${body ? '"strings"' : ''}
    "io"
)

func main() {
    url := "${url}"
    ${body ? `payload := strings.NewReader(\`${body}\`)` : 'var payload io.Reader = nil'}

    req, err := http.NewRequest("${method}", url, payload)
    if err != nil {
        panic(err)
    }

    ${Object.entries(headers)
      .map(([k, v]) => `req.Header.Add("${k}", "${v}")`)
      .join('\n    ')}

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer res.Body.Close()

    bodyBytes, _ := io.ReadAll(res.Body)
    fmt.Println(string(bodyBytes))
}`;
    }

    if (targetLang === 'php') {
      return `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->request('${method}', '${url}', [
  'headers' => ${JSON.stringify(headers, null, 4)},
  ${body ? `'body' => '${body}'` : ''}
]);

echo $response->getBody();`;
    }

    return '';
  }, [parsedCurl, targetLang]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    addHistoryItem('curl-converter', `Converted cURL to ${targetLang.toUpperCase()}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToApiTester = () => {
    const encodedUrl = encodeURIComponent(parsedCurl.url);
    const encodedMethod = encodeURIComponent(parsedCurl.method);
    router.push(`/tools/api-tester?url=${encodedUrl}&method=${encodedMethod}`);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-accent shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-devText-primary">cURL Parser & Code Generator</h2>
            <p className="text-xs text-devText-secondary">
              Parse cURL commands into Fetch, Axios, Python, Go, PHP, or test in API Tester.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendToApiTester}
            className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-accent text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to API Tester →</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Input cURL */}
      <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
          <span>PASTE RAW cURL COMMAND</span>
          <button onClick={() => setCurlInput('')} className="hover:text-devText-primary text-xs">
            Clear
          </button>
        </div>
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder="Paste cURL command here (curl -X POST https://...)"
          className="p-3 bg-transparent font-mono text-xs text-devText-primary focus:outline-none resize-none h-32"
        />
      </div>

      {/* Language Selector Tabs & Generated Code */}
      <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {(['fetch', 'axios', 'python', 'go', 'php'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors ${
                  targetLang === lang
                    ? 'bg-accent text-white'
                    : 'text-devText-secondary hover:text-devText-primary hover:bg-surface'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-devText-muted hidden sm:inline">
            Method: <strong className="text-accent">{parsedCurl.method}</strong> | Headers:{' '}
            <strong className="text-emerald-400">{Object.keys(parsedCurl.headers).length}</strong>
          </span>
        </div>

        <pre className="p-4 bg-background font-mono text-xs text-emerald-300 overflow-x-auto max-h-80 whitespace-pre-wrap">
          {generatedCode}
        </pre>
      </div>

      <PostExecutionRecommendations
        currentOutput={generatedCode}
        actions={[
          { id: 'curl-api', label: 'Test in API Tester', targetSlug: 'api-tester' },
          { id: 'curl-json', label: 'Format Request Body', targetSlug: 'json-formatter' },
          { id: 'curl-ai', label: 'Explain Request with AI', targetSlug: 'ai-assistant' },
        ]}
      />
    </div>
  );
}
