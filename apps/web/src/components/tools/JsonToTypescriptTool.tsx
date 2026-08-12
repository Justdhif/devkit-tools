'use client';

import React, { useState } from 'react';
import { Copy, Check, Code2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import {
  jsonToTypescript,
  jsonToZod,
  jsonToGoStruct,
  jsonToPythonDataclass,
} from '@devkit/json-tools';
import { useDevKitStore } from '../../store/useDevKitStore';
import { aiService } from '../../services/aiService';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const SAMPLE_JSON = `{\n  "id": "usr_9921",\n  "username": "alex_dev",\n  "email": "alex@devkit.app",\n  "active": true,\n  "roles": ["admin", "developer"],\n  "settings": {\n    "theme": "dark",\n    "notifications": true\n  }\n}`;

export function JsonToTypescriptTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [targetType, setTargetType] = useState<'ts' | 'zod' | 'go' | 'python'>('ts');
  const [rootName, setRootName] = useState('UserProfile');
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const TARGET_LANG_MAP = { ts: 'typescript', zod: 'zod', go: 'go', python: 'python' } as const;

  const handleConvert = () => {
    let res;
    if (targetType === 'ts') res = jsonToTypescript(input, rootName);
    else if (targetType === 'zod') res = jsonToZod(input, rootName);
    else if (targetType === 'go') res = jsonToGoStruct(input, rootName);
    else res = jsonToPythonDataclass(input, rootName);

    if (res.success) {
      setOutput(res.result);
      setError(undefined);
      addHistoryItem('json-to-typescript', `Converted JSON to ${targetType.toUpperCase()}`);
    } else {
      setError(res.error);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI: describe a JSON structure → AI generates JSON → convert to types
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiExplanation(null);

    try {
      const lang = TARGET_LANG_MAP[targetType];
      const res = await aiService.convertJson({
        jsonString: aiPrompt,
        targetLanguage: lang,
      });
      if (res.code) {
        setOutput(res.code);
        setError(undefined);
      }
      setAiExplanation(res.explanation);
      addHistoryItem('json-to-typescript', `AI JSON → ${targetType.toUpperCase()}: "${aiPrompt.slice(0, 50)}"`);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate types with AI');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* AI Assistant Banner */}
      <div className="bg-surface p-3.5 rounded-lg border border-accent/30 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI JSON Converter: Paste JSON or describe the structure you need...
          </label>
          <span className="text-[10px] text-devText-muted font-mono">Powered by Groq LLM</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            placeholder={`e.g. {"user": {"id": 1, "name": "John"}} or "a product with nested variants"`}
            className="flex-1 font-mono text-xs"
          />
          <Button
            onClick={handleAiGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
            size="sm"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate with AI</span>
              </>
            )}
          </Button>
        </div>
        {aiExplanation && (
          <p className="text-[11px] text-devText-secondary bg-background p-2 rounded border border-border">
            <span className="font-semibold text-accent">AI Notes: </span>
            {aiExplanation}
          </p>
        )}
        {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
      </div>

      {/* Target Selector & Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-devText-muted font-medium">Target Language:</span>
            <div className="flex bg-background border border-border rounded-md p-0.5">
              {(['ts', 'zod', 'go', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTargetType(lang)}
                  className={`px-2.5 py-1 text-xs rounded uppercase font-semibold transition-colors ${
                    targetType === lang
                      ? 'bg-accent text-white'
                      : 'text-devText-secondary hover:text-devText-primary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-devText-muted">Root Name:</label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="bg-background border border-border text-devText-primary rounded px-2 py-1 text-xs focus:outline-none w-36"
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Code2 className="w-4 h-4" />
          <span>Generate Code</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between">
            <span>RAW JSON OBJECT</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON object..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>GENERATED TYPE DEFINITIONS</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="hover:text-devText-primary text-xs flex items-center space-x-1 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Click 'Generate Code' or use AI above to generate types..."
            className="flex-1 w-full p-3 bg-transparent text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
