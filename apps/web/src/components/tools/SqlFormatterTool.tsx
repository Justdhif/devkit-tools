'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

const SAMPLE_SQL = `SELECT u.id, u.username, u.email, count(o.id) as total_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2026-01-01' GROUP BY u.id, u.username, u.email HAVING count(o.id) > 5 ORDER BY total_orders DESC;`;

export function SqlFormatterTool() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Embedded AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDialect, setAiDialect] = useState<'postgres' | 'mysql' | 'sqlite'>('postgres');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFormat = () => {
    let formatted = input
      .replace(/\s+/g, ' ')
      .replace(/\b(SELECT|FROM|WHERE|LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|UPDATE|DELETE|INSERT INTO|VALUES|SET|AND|OR)\b/gi, '\n$1')
      .replace(/\s*,\s*/g, ',\n  ')
      .trim();
    setOutput(formatted);
  };

  const handleMinify = () => {
    const minified = input.replace(/\s+/g, ' ').trim();
    setOutput(minified);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateSql = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiExplanation(null);

    try {
      const res = await aiService.generateSql({ prompt: aiPrompt, dialect: aiDialect });
      if (res.sql) {
        setInput(res.sql);
        setOutput(res.sql);
      }
      setAiExplanation(res.explanation);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate SQL with AI');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Embedded Contextual AI Assistant Banner */}
      <div className="bg-surface p-3.5 rounded-lg border border-accent/30 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Assistant: Describe the SQL query you need...
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={aiDialect}
              onChange={(e: any) => setAiDialect(e.target.value)}
              className="bg-background text-devText-primary border border-border text-[11px] rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
            </select>
            <span className="text-[10px] text-devText-muted font-mono">Groq LLM</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateSql()}
            placeholder="e.g. get total sales by product category for Q1 2026..."
            className="flex-1 bg-background border border-border text-devText-primary rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleGenerateSql}
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
                <span>Generate SQL</span>
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

      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-devText-primary">SQL Query Processor</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFormat}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format SQL</span>
          </button>
          <button
            onClick={handleMinify}
            className="px-3.5 py-1.5 bg-background border border-border text-devText-primary hover:bg-surface text-xs font-medium rounded-md transition-colors"
          >
            Minify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted">
            <span>RAW SQL QUERY</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste SQL query here..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>FORMATTED SQL OUTPUT</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="hover:text-devText-primary text-xs flex items-center space-x-1 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Formatted query output..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
