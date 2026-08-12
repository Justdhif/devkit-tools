'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToolHelp, ToolHelpInfo } from '../data/toolHelpData';
import { Button } from './ui/button';

interface ToolHelpSectionProps {
  toolSlug: string;
  defaultExpanded?: boolean;
}

export function ToolHelpSection({ toolSlug, defaultExpanded = false }: ToolHelpSectionProps) {
  const helpInfo: ToolHelpInfo | undefined = getToolHelp(toolSlug);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!helpInfo) return null;

  const handleCopyExample = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="tool-help-section" className="w-full">
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        {/* Banner Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-surface/80 hover:bg-surface transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-devText-primary flex items-center gap-2">
                Help & Documentation Guide
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Guide
                </span>
              </h3>
              <p className="text-xs text-devText-secondary mt-0.5">
                Learn how to use this tool, key features, code examples, and pro tips.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-accent">
            <span>{isExpanded ? 'Hide Guide' : 'View Guide'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-border divide-y divide-border"
            >
              {/* Overview & Quick Steps */}
              <div className="p-5 sm:p-6 space-y-4 bg-background/50">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent">Overview</h4>
                  <p className="text-xs text-devText-primary leading-relaxed">{helpInfo.overview}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    How to Use (Step-by-Step)
                  </h4>
                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-devText-secondary">
                    {helpInfo.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface border border-border flex items-start space-x-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Key Features & Pro Tips */}
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Key Features & Security
                  </h4>
                  <ul className="space-y-1.5 text-xs text-devText-secondary">
                    {helpInfo.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Tips */}
                {helpInfo.proTips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Pro Tips & Best Practices
                    </h4>
                    <ul className="space-y-1.5 text-xs text-devText-secondary">
                      {helpInfo.proTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start space-x-2 p-2 rounded bg-amber-950/20 border border-amber-800/30 text-amber-200">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Code / Input Output Examples */}
              {helpInfo.examples.length > 0 && (
                <div className="p-5 sm:p-6 space-y-4 bg-background/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Examples & Use Cases
                  </h4>

                  <div className="space-y-4">
                    {helpInfo.examples.map((ex, idx) => (
                      <div key={idx} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-devText-primary">{ex.title}</h5>
                          {ex.description && <span className="text-[11px] text-devText-muted">{ex.description}</span>}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 bg-background border border-border rounded-lg space-y-1">
                            <span className="text-[10px] text-devText-muted uppercase font-bold tracking-wider">Input</span>
                            <pre className="text-devText-secondary whitespace-pre-wrap break-all">{ex.input}</pre>
                          </div>

                          <div className="p-3 bg-background border border-border rounded-lg space-y-1 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Output</span>
                              <button
                                onClick={() => handleCopyExample(ex.output, idx)}
                                className="text-devText-muted hover:text-accent transition-colors p-0.5"
                                title="Copy example output"
                              >
                                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <pre className="text-accent whitespace-pre-wrap break-all">{ex.output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {helpInfo.faq.length > 0 && (
                <div className="p-5 sm:p-6 space-y-3 bg-surface">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-devText-muted flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Frequently Asked Questions
                  </h4>

                  <div className="space-y-3">
                    {helpInfo.faq.map((q, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-xs font-bold text-devText-primary">Q: {q.question}</p>
                        <p className="text-xs text-devText-secondary leading-relaxed">A: {q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
