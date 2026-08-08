'use client';

import React, { useState } from 'react';
import { Regex as RegexIcon, AlertCircle, Sparkles, Loader2, Check } from 'lucide-react';
import { testRegex, RegexTestOutput } from '@devkit/regex-tools';
import { aiService } from '../../services/aiService';

export function RegexTesterTool() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState(
    'Welcome to DevKit! Contact support@devkit.app or admin@company.io for help.'
  );

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const result: RegexTestOutput = testRegex(pattern, flags, testString);

  const handleGenerateRegex = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiExplanation(null);

    try {
      const res = await aiService.generateRegex({ prompt: aiPrompt });
      if (res.pattern) setPattern(res.pattern);
      if (res.flags) setFlags(res.flags);
      setAiExplanation(res.explanation);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate regex with AI');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      <div className="bg-surface p-3.5 rounded-lg border border-accent/30 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Assistant: Describe the regex pattern you need...
          </label>
          <span className="text-[10px] text-devText-muted font-mono">Powered by Groq LLM</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateRegex()}
            placeholder="e.g. match phone numbers with optional country code (+62 or 08)..."
            className="flex-1 bg-background border border-border text-devText-primary rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleGenerateRegex}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-3 py-1.5 bg-accent text-background font-medium text-xs rounded hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center space-x-1 shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Regex</span>
              </>
            )}
          </button>
        </div>
        {aiExplanation && (
          <p className="text-[11px] text-devText-secondary bg-background p-2 rounded border border-border">
            <span className="font-semibold text-accent">AI Explanation: </span>
            {aiExplanation}
          </p>
        )}
        {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <span className="text-devText-muted font-mono text-base font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern (e.g. \\d+)"
            className="flex-1 bg-background border border-border text-devText-primary rounded px-3 py-1.5 font-mono text-xs focus:outline-none"
          />
          <span className="text-devText-muted font-mono text-base font-bold">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-16 bg-background border border-border text-devText-primary rounded px-2 py-1.5 font-mono text-xs focus:outline-none"
          />
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded bg-accent/10 border border-accent/20 text-accent">
          {result.count} Matches Found
        </div>
      </div>

      {!result.success && result.error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted">
            <span>TEST STRING INPUT</span>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type text to test regex against..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[250px]"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted">
            <span>MATCH DETAILS ({result.matches.length})</span>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto max-h-[350px]">
            {result.matches.length === 0 ? (
              <div className="text-devText-muted text-xs p-4 text-center">No regex matches found.</div>
            ) : (
              result.matches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-background border border-border rounded flex flex-col space-y-1 text-xs font-mono"
                >
                  <div className="flex justify-between items-center text-accent font-bold">
                    <span>Match #{idx + 1}: &quot;{m.match}&quot;</span>
                    <span className="text-devText-muted text-[10px]">Index: {m.index}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
