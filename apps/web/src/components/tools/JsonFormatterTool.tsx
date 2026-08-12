'use client';

import React, { useState } from 'react';
import { Copy, Download, Check, AlertCircle, Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';
import { formatJson, minifyJson, validateJson } from '@devkit/json-tools';
import { useDevKitStore } from '../../store/useDevKitStore';
import { aiService } from '../../services/aiService';
import { AiExplainErrorResponse } from '@devkit/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { Textarea } from '../ui/input';

const SAMPLE_JSON = `{\n  "name": "DevKit",\n  "type": "Developer Productivity Platform",\n  "features": ["JSON Formatter", "JWT Decoder", "UUID Generator"],\n  "privacyFirst": true,\n  "stats": {\n    "speedMs": 0,\n    "version": "1.0.0"\n  }\n}`;

export function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

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
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-devText-muted" />
            <span className="text-devText-muted font-medium">Indent:</span>
            <Select value={String(indent)} onValueChange={(val) => setIndent(Number(val))}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="Indent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sortKeys"
              checked={sortKeys}
              onCheckedChange={(c) => setSortKeys(Boolean(c))}
            />
            <label htmlFor="sortKeys" className="text-devText-secondary cursor-pointer select-none">
              Sort Keys Alphabetically
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleFormat} size="sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format</span>
          </Button>

          <Button onClick={handleMinify} variant="secondary" size="sm">
            Minify
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExplainErrorWithAi}
              disabled={aiLoading}
              className="bg-accent/20 border border-accent/40 text-accent font-semibold hover:bg-accent/30 text-[11px]"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Explain Error with AI</span>
            </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <span>INPUT JSON</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput('');
                setError(undefined);
                setAiErrorResult(null);
              }}
              className="h-auto p-0 hover:bg-transparent text-[11px]"
            >
              Clear
            </Button>
          </CardHeader>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="h-[360px] border-0 bg-transparent rounded-none resize-none font-mono text-xs"
          />
        </Card>

        <Card>
          <CardHeader>
            <span>RESULT OUTPUT</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="h-auto p-0 hover:bg-transparent text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={!output}
                className="h-auto p-0 hover:bg-transparent text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </Button>
            </div>
          </CardHeader>
          <Textarea
            readOnly
            value={output}
            placeholder="Formatted or minified output will appear here..."
            className="h-[360px] border-0 bg-transparent rounded-none resize-none font-mono text-xs"
          />
        </Card>
      </div>
    </div>
  );
}
