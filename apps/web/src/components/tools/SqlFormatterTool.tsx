'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, Sparkles } from 'lucide-react';

const SAMPLE_SQL = `SELECT u.id, u.username, u.email, count(o.id) as total_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2026-01-01' GROUP BY u.id, u.username, u.email HAVING count(o.id) > 5 ORDER BY total_orders DESC;`;

export function SqlFormatterTool() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    // Standard SQL keyword formatting
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

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
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
