'use client';

import React, { useState, useMemo } from 'react';
import { GitCompare, Copy, Check, Sparkles, ArrowRightLeft } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { PostExecutionRecommendations } from '../PostExecutionRecommendations';

const SAMPLE_TEXT_A = `{\n  "name": "DevKit Platform",\n  "version": "1.0.0",\n  "status": "active",\n  "environment": "staging",\n  "maxUsers": 100\n}`;

const SAMPLE_TEXT_B = `{\n  "name": "DevKit Platform",\n  "version": "1.2.0",\n  "status": "active",\n  "environment": "production",\n  "maxUsers": 500,\n  "newFeature": true\n}`;

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

export function DiffViewerTool() {
  const [originalText, setOriginalText] = useState(SAMPLE_TEXT_A);
  const [modifiedText, setModifiedText] = useState(SAMPLE_TEXT_B);
  const [copied, setCopied] = useState(false);
  const [autoFormatJson, setAutoFormatJson] = useState(true);
  const { addHistoryItem } = useDevKitStore();

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleFormatBothJson = () => {
    try {
      if (originalText.trim()) setOriginalText(JSON.stringify(JSON.parse(originalText), null, 2));
      if (modifiedText.trim()) setModifiedText(JSON.stringify(JSON.parse(modifiedText), null, 2));
    } catch {
      // ignore syntax error
    }
  };

  // Simple line-by-line diff algorithm
  const diffResult = useMemo(() => {
    let orig = originalText;
    let mod = modifiedText;

    if (autoFormatJson) {
      try {
        if (orig.trim().startsWith('{') || orig.trim().startsWith('[')) {
          orig = JSON.stringify(JSON.parse(orig), null, 2);
        }
        if (mod.trim().startsWith('{') || mod.trim().startsWith('[')) {
          mod = JSON.stringify(JSON.parse(mod), null, 2);
        }
      } catch {
        // fallback to unformatted
      }
    }

    const linesA = orig.split('\n');
    const linesB = mod.split('\n');
    const result: DiffLine[] = [];

    let i = 0;
    let j = 0;

    while (i < linesA.length || j < linesB.length) {
      const lineA = linesA[i];
      const lineB = linesB[j];

      if (lineA === lineB) {
        if (lineA !== undefined) {
          result.push({ type: 'unchanged', text: lineA, leftLineNum: i + 1, rightLineNum: j + 1 });
        }
        i++;
        j++;
      } else if (lineA !== undefined && !linesB.slice(j).includes(lineA)) {
        result.push({ type: 'removed', text: lineA, leftLineNum: i + 1 });
        i++;
      } else if (lineB !== undefined && !linesA.slice(i).includes(lineB)) {
        result.push({ type: 'added', text: lineB, rightLineNum: j + 1 });
        j++;
      } else {
        if (lineA !== undefined) result.push({ type: 'removed', text: lineA, leftLineNum: i + 1 });
        if (lineB !== undefined) result.push({ type: 'added', text: lineB, rightLineNum: j + 1 });
        i++;
        j++;
      }
    }

    return result;
  }, [originalText, modifiedText, autoFormatJson]);

  const diffStats = useMemo(() => {
    const added = diffResult.filter((d) => d.type === 'added').length;
    const removed = diffResult.filter((d) => d.type === 'removed').length;
    return { added, removed };
  }, [diffResult]);

  const handleCopySummary = () => {
    const summary = diffResult
      .map((d) => (d.type === 'added' ? `+ ${d.text}` : d.type === 'removed' ? `- ${d.text}` : `  ${d.text}`))
      .join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    addHistoryItem('diff-viewer', `Compared ${diffStats.added} additions & ${diffStats.removed} deletions`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-accent shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-devText-primary">Code & JSON Diff Viewer</h2>
            <p className="text-xs text-devText-secondary">
              Compare two text or JSON documents side-by-side with line-by-line diff highlighting.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 text-xs text-devText-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={autoFormatJson}
              onChange={(e) => setAutoFormatJson(e.target.checked)}
              className="rounded bg-background border-border text-accent focus:ring-0"
            />
            <span>Auto-Format JSON</span>
          </label>

          <button
            onClick={handleFormatBothJson}
            className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg transition-colors"
          >
            Prettify JSON
          </button>

          <button
            onClick={handleSwap}
            title="Swap Original and Modified"
            className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Diff'}</span>
          </button>
        </div>
      </div>

      {/* Input Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>ORIGINAL (BEFORE)</span>
            <button onClick={() => setOriginalText('')} className="hover:text-devText-primary text-xs">
              Clear
            </button>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text or JSON here..."
            className="p-3 bg-transparent font-mono text-xs text-devText-primary focus:outline-none resize-none h-48"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>MODIFIED (AFTER)</span>
            <button onClick={() => setModifiedText('')} className="hover:text-devText-primary text-xs">
              Clear
            </button>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text or JSON here..."
            className="p-3 bg-transparent font-mono text-xs text-devText-primary focus:outline-none resize-none h-48"
          />
        </div>
      </div>

      {/* Diff Result Stats & Line Output */}
      <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>DIFF HIGHLIGHT RESULT</span>
          </span>

          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">+{diffStats.added} additions</span>
            <span className="text-rose-400 font-bold">-{diffStats.removed} deletions</span>
          </div>
        </div>

        <div className="p-3 font-mono text-xs max-h-96 overflow-y-auto space-y-0.5 bg-background">
          {diffResult.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-start px-2 py-0.5 rounded text-[11px] font-mono ${
                line.type === 'added'
                  ? 'bg-emerald-950/40 border-l-2 border-emerald-500 text-emerald-300'
                  : line.type === 'removed'
                  ? 'bg-rose-950/40 border-l-2 border-rose-500 text-rose-300 line-through opacity-80'
                  : 'text-devText-secondary hover:bg-surface/50'
              }`}
            >
              <span className="w-8 shrink-0 text-devText-muted text-[10px] select-none text-right pr-2">
                {line.leftLineNum || ''}
              </span>
              <span className="w-8 shrink-0 text-devText-muted text-[10px] select-none text-right pr-2">
                {line.rightLineNum || ''}
              </span>
              <span className="w-4 shrink-0 font-bold select-none">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all">{line.text}</span>
            </div>
          ))}
        </div>
      </div>

      <PostExecutionRecommendations
        currentOutput={originalText}
        actions={[
          { id: 'diff-fmt', label: 'Format JSON', targetSlug: 'json-formatter' },
          { id: 'diff-ts', label: 'Generate TypeScript', targetSlug: 'json-to-typescript' },
          { id: 'diff-ai', label: 'Explain Differences with AI', targetSlug: 'ai-assistant' },
        ]}
      />
    </div>
  );
}
