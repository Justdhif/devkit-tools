'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Code,
  Copy,
  Check,
  HelpCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToolHelp, ToolHelpInfo } from '../data/toolHelpData';

interface ToolHelpDrawerProps {
  toolSlug: string;
  toolName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolHelpDrawer({ toolSlug, toolName, isOpen, onClose }: ToolHelpDrawerProps) {
  const helpInfo: ToolHelpInfo | undefined = getToolHelp(toolSlug);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!helpInfo) return null;

  const handleCopyExample = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Slide-over Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-sidebar shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-devText-primary flex items-center gap-2">
                    {toolName} Guide
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Docs
                    </span>
                  </h3>
                  <p className="text-xs text-devText-secondary mt-0.5">
                    Step-by-step instructions, examples, and best practices
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-devText-muted hover:text-devText-primary hover:bg-background border border-transparent hover:border-border transition-colors"
                title="Close Documentation (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs custom-scrollbar">
              {/* Overview */}
              <div className="space-y-1.5 p-4 rounded-xl bg-background/60 border border-border">
                <h4 className="font-bold uppercase tracking-wider text-accent text-[11px]">
                  Overview
                </h4>
                <p className="text-devText-primary leading-relaxed">{helpInfo.overview}</p>
              </div>

              {/* Step-by-Step Usage */}
              <div className="space-y-2.5">
                <h4 className="font-bold uppercase tracking-wider text-accent text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  How to Use (Step-by-Step)
                </h4>
                <ol className="space-y-2">
                  {helpInfo.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-background/50 border border-border flex items-start space-x-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed text-devText-primary">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Key Features & Security */}
              <div className="space-y-2.5">
                <h4 className="font-bold uppercase tracking-wider text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Key Features & Privacy Safeguard
                </h4>
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                  <ul className="space-y-1.5 text-devText-secondary">
                    {helpInfo.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span className="text-devText-primary">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pro Tips */}
              {helpInfo.proTips.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold uppercase tracking-wider text-amber-400 text-[11px] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Pro Tips & Recommendations
                  </h4>
                  <div className="space-y-2">
                    {helpInfo.proTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200 flex items-start space-x-2.5"
                      >
                        <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Examples */}
              {helpInfo.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-accent text-[11px] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Examples & Sample Usage
                  </h4>

                  <div className="space-y-3">
                    {helpInfo.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-background border border-border rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-devText-primary">{ex.title}</h5>
                          {ex.description && (
                            <span className="text-[10px] text-devText-muted">
                              {ex.description}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="p-2.5 bg-surface border border-border rounded-md space-y-1">
                            <span className="text-[9px] text-devText-muted uppercase font-bold tracking-wider">
                              Input
                            </span>
                            <pre className="text-devText-secondary whitespace-pre-wrap break-all">
                              {ex.input}
                            </pre>
                          </div>

                          <div className="p-2.5 bg-surface border border-border rounded-md space-y-1 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider">
                                Output
                              </span>
                              <button
                                onClick={() => handleCopyExample(ex.output, idx)}
                                className="text-devText-muted hover:text-accent transition-colors p-0.5"
                                title="Copy output"
                              >
                                {copiedIndex === idx ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <pre className="text-accent whitespace-pre-wrap break-all">
                              {ex.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {helpInfo.faq.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="font-bold uppercase tracking-wider text-devText-muted text-[11px] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Frequently Asked Questions
                  </h4>

                  <div className="space-y-3">
                    {helpInfo.faq.map((q, idx) => (
                      <div key={idx} className="p-3 bg-background/50 border border-border rounded-lg space-y-1">
                        <p className="font-bold text-devText-primary">Q: {q.question}</p>
                        <p className="text-devText-secondary leading-relaxed">A: {q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
