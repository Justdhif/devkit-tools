'use client';

import React, { useState } from 'react';
import { Copy, Download, Check, AlertCircle, Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';
import { formatJson, minifyJson, validateJson } from '@devkit/json-tools';
import { useDevKitStore } from '../../store/useDevKitStore';
import { aiService } from '../../services/aiService';
import { AiExplainErrorResponse } from '@devkit/shared';

const SAMPLE_JSON = `{\n  "name": "DevKit",\n  "type": "Developer Productivity Platform",\n  "features": ["JSON Formatter", "JWT Decoder", "UUID Generator"],\n  "privacyFirst": true,\n  "stats": {\n    "speedMs": 0,\n    "version": "1.0.0"\n  }\n}`;

export function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  // Embedded AI Error Explainer states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErrorResult, setAiErrorResult] = useState<AiExplainErrorResponse | null>(null);

  const handleFormat = () => {
    setAiErrorResult(null);
    const res = formatJson(input, { indent, sortKeys });
    if (res.success) {
      setOutput(res.result);
      setError(undefined);
      addHistoryItem('json-formatter', 'Formatted JSON document');
    } else {
      setError(res.error);
    }
  };

  const handleMinify = () => {
    setAiErrorResult(null);
    const res = minifyJson(input);
    if (res.success) {
      setOutput(res.result);
      setError(undefined);
      addHistoryItem('json-formatter', 'Minified JSON document');
    } else {
      setError(res.error);
    }
  };

  const handleExplainErrorWithAi = async () => {
    if (!error && !input) return;
    setAiLoading(true);
    try {
      const res = await aiService.explainError({
        errorText: error || 'JSON Syntax error',
        context: `JSON Input Snippet: ${input.substring(0, 300)}`,
      });
      setAiErrorResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devkit-formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center space-x-3 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <div className="flex items-center space-x-2">
            <label className="text-devText-muted">Indent:</label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="bg-background border border-border text-devText-primary rounded px-2 py-1 focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-devText-secondary hover:text-devText-primary">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded accent-accent"
            />
            <span>Sort Keys Alphabetically</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format</span>
          </button>

          <button
            onClick={handleMinify}
            className="px-3 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            Minify
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleExplainErrorWithAi}
              disabled={aiLoading}
              className="px-2.5 py-1 bg-accent/20 border border-accent/40 text-accent font-semibold rounded text-[11px] hover:bg-accent/30 transition-colors flex items-center space-x-1"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Explain Error with AI</span>
            </button>
          </div>

          {aiErrorResult && (
            <div className="p-3 bg-background border border-border rounded-md text-xs text-devText-primary space-y-2 mt-2">
              <div className="flex items-center space-x-1.5 text-accent font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Error Diagnosis:</span>
              </div>
              <p><strong>Cause:</strong> {aiErrorResult.cause}</p>
              <p><strong>Explanation:</strong> {aiErrorResult.explanation}</p>
              <p className="text-emerald-400"><strong>Likely Fix:</strong> {aiErrorResult.likelyFix}</p>
            </div>
          )}
        </div>
      )}

      {/* Input / Output Workspace Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* INPUT PANEL */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>INPUT JSON</span>
            <button
              onClick={() => {
                setInput('');
                setError(undefined);
                setAiErrorResult(null);
              }}
              className="hover:text-devText-primary text-[11px]"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        {/* OUTPUT PANEL */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>RESULT OUTPUT</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="hover:text-devText-primary text-xs flex items-center space-x-1 disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="hover:text-devText-primary text-xs flex items-center space-x-1 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Formatted or minified output will appear here..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
