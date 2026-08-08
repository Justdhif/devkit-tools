'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  Code2,
  Database,
  Regex as RegexIcon,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import {
  AiExplainErrorResponse,
  AiGenerateRegexResponse,
  AiGenerateSqlResponse,
  AiConvertJsonResponse,
  AiExplainCodeResponse,
} from '@devkit/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AiTab = 'regex' | 'sql' | 'error' | 'code' | 'json';

export function AiAssistantTool({ initialTab }: { initialTab?: AiTab }) {
  const [activeTab, setActiveTab] = useState<AiTab>(initialTab || 'regex');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Inputs
  const [regexPrompt, setRegexPrompt] = useState('match email addresses with custom domains like .app or .io');
  const [sqlPrompt, setSqlPrompt] = useState('get total orders and sum of amount grouped by user_id for year 2026');
  const [sqlDialect, setSqlDialect] = useState<'postgres' | 'mysql' | 'sqlite'>('postgres');
  const [errorText, setErrorText] = useState('TypeError: Cannot read properties of undefined (reading \'map\') at UserList.tsx:24');
  const [codeText, setCodeText] = useState('function debounce(fn, ms) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn.apply(this, args), ms);\n  };\n}');
  const [jsonText, setJsonText] = useState('{\n  "id": 101,\n  "username": "devkit_user",\n  "roles": ["admin", "developer"],\n  "isActive": true\n}');
  const [targetLang, setTargetLang] = useState<'typescript' | 'zod' | 'go' | 'python'>('typescript');

  // Outputs
  const [regexResult, setRegexResult] = useState<AiGenerateRegexResponse | null>(null);
  const [sqlResult, setSqlResult] = useState<AiGenerateSqlResponse | null>(null);
  const [errorResult, setErrorResult] = useState<AiExplainErrorResponse | null>(null);
  const [codeResult, setCodeResult] = useState<AiExplainCodeResponse | null>(null);
  const [jsonResult, setJsonResult] = useState<AiConvertJsonResponse | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAi = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'regex') {
        const res = await aiService.generateRegex({ prompt: regexPrompt });
        setRegexResult(res);
      } else if (activeTab === 'sql') {
        const res = await aiService.generateSql({ prompt: sqlPrompt, dialect: sqlDialect });
        setSqlResult(res);
      } else if (activeTab === 'error') {
        const res = await aiService.explainError({ errorText });
        setErrorResult(res);
      } else if (activeTab === 'code') {
        const res = await aiService.explainCode({ code: codeText });
        setCodeResult(res);
      } else if (activeTab === 'json') {
        const res = await aiService.convertJson({ jsonString: jsonText, targetLanguage: targetLang });
        setJsonResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while calling Groq AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-accent/20 via-purple-500/10 to-transparent p-4 rounded-xl border border-accent/30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent/20 border border-accent/40 text-accent">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-devText-primary flex items-center gap-2">
              Contextual AI Developer Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-mono font-bold">
                Groq LLM Powered
              </span>
            </h2>
            <p className="text-xs text-devText-secondary">
              Embedded developer utilities powered by Groq Llama 3.3 70B model.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAi}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-accent text-background font-medium text-xs rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('regex')}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'regex'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-devText-muted hover:text-devText-primary'
          }`}
        >
          <RegexIcon className="w-3.5 h-3.5" />
          <span>Regex Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-devText-muted hover:text-devText-primary'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQL Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('error')}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'error'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-devText-muted hover:text-devText-primary'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Error Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-devText-muted hover:text-devText-primary'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'json'
              ? 'border-accent text-accent bg-surface'
              : 'border-transparent text-devText-muted hover:text-devText-primary'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>JSON Converter</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Input Box */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>INPUT PROMPT & CONTEXT</span>
            {activeTab === 'sql' && (
              <Select value={sqlDialect} onValueChange={(val: any) => setSqlDialect(val)}>
                <SelectTrigger className="w-32 h-7 text-[11px]">
                  <SelectValue placeholder="Select Dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            )}
            {activeTab === 'json' && (
              <Select value={targetLang} onValueChange={(val: any) => setTargetLang(val)}>
                <SelectTrigger className="w-44 h-7 text-[11px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript Interface</SelectItem>
                  <SelectItem value="zod">Zod Schema</SelectItem>
                  <SelectItem value="go">Go Struct</SelectItem>
                  <SelectItem value="python">Python Dataclass</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="p-3 flex-1 flex flex-col space-y-3">
            {activeTab === 'regex' && (
              <textarea
                value={regexPrompt}
                onChange={(e) => setRegexPrompt(e.target.value)}
                placeholder="Describe what pattern you want to match in natural language..."
                className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
              />
            )}
            {activeTab === 'sql' && (
              <textarea
                value={sqlPrompt}
                onChange={(e) => setSqlPrompt(e.target.value)}
                placeholder="Describe the database query you want in natural language..."
                className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
              />
            )}
            {activeTab === 'error' && (
              <textarea
                value={errorText}
                onChange={(e) => setErrorText(e.target.value)}
                placeholder="Paste stack trace or error log here..."
                className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
              />
            )}
            {activeTab === 'code' && (
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                placeholder="Paste code snippet to analyze..."
                className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
              />
            )}
            {activeTab === 'json' && (
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste raw JSON object here..."
                className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px]"
              />
            )}
          </div>
        </div>

        {/* Right Output Box */}
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-sidebar text-xs font-semibold text-devText-muted flex justify-between items-center">
            <span>AI RESULT & EXPLANATION</span>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
            {!regexResult && !sqlResult && !errorResult && !codeResult && !jsonResult && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-devText-muted">
                <Sparkles className="w-8 h-8 opacity-40 text-accent" />
                <p>Click &quot;Generate with AI&quot; above to process your prompt using Groq LLM.</p>
              </div>
            )}

            {/* Regex Result */}
            {activeTab === 'regex' && regexResult && (
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center text-accent font-bold">
                    <span>Pattern: /{regexResult.pattern}/{regexResult.flags}</span>
                    <button
                      onClick={() => handleCopy(`/${regexResult.pattern}/${regexResult.flags}`)}
                      className="text-devText-muted hover:text-accent transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-devText-primary mb-1">Explanation:</h4>
                  <p className="text-devText-secondary leading-relaxed">{regexResult.explanation}</p>
                </div>
                {regexResult.testExamples?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-devText-primary mb-1">Test Examples:</h4>
                    <ul className="list-disc list-inside space-y-1 font-mono text-devText-secondary">
                      {regexResult.testExamples.map((ex, idx) => (
                        <li key={idx}>&quot;{ex}&quot;</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* SQL Result */}
            {activeTab === 'sql' && sqlResult && (
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded font-mono text-xs relative">
                  <button
                    onClick={() => handleCopy(sqlResult.sql)}
                    className="absolute top-2 right-2 text-devText-muted hover:text-accent transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-emerald-400 whitespace-pre-wrap">{sqlResult.sql}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-devText-primary mb-1">Explanation:</h4>
                  <p className="text-devText-secondary leading-relaxed">{sqlResult.explanation}</p>
                </div>
              </div>
            )}

            {/* Error Explainer Result */}
            {activeTab === 'error' && errorResult && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded space-y-1">
                  <h4 className="font-bold text-rose-300">Root Cause:</h4>
                  <p className="text-devText-primary">{errorResult.cause}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-devText-primary mb-1">Detailed Explanation:</h4>
                  <p className="text-devText-secondary leading-relaxed">{errorResult.explanation}</p>
                </div>

                <div className="p-3 bg-accent/10 border border-accent/30 rounded space-y-1">
                  <h4 className="font-bold text-accent">Likely Fix:</h4>
                  <p className="text-devText-primary">{errorResult.likelyFix}</p>
                </div>

                {errorResult.codeExample && (
                  <div>
                    <h4 className="font-semibold text-devText-primary mb-1">Suggested Code Fix:</h4>
                    <pre className="p-3 bg-background border border-border rounded font-mono text-xs text-amber-300 overflow-x-auto">
                      {errorResult.codeExample}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Code Explainer Result */}
            {activeTab === 'code' && codeResult && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-devText-primary mb-1">Summary:</h4>
                  <p className="text-devText-secondary leading-relaxed">{codeResult.explanation}</p>
                </div>

                {codeResult.flow?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-devText-primary mb-1">Execution Flow:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-devText-secondary">
                      {codeResult.flow.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {codeResult.potentialIssues?.length > 0 && (
                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded space-y-2">
                    <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Potential Issues & Edge Cases:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-devText-secondary">
                      {codeResult.potentialIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* JSON Converter Result */}
            {activeTab === 'json' && jsonResult && (
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded font-mono text-xs relative">
                  <button
                    onClick={() => handleCopy(jsonResult.code)}
                    className="absolute top-2 right-2 text-devText-muted hover:text-accent transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-cyan-300 whitespace-pre-wrap">{jsonResult.code}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-devText-primary mb-1">Notes:</h4>
                  <p className="text-devText-secondary leading-relaxed">{jsonResult.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
