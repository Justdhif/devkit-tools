'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, GitMerge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectSmartContext } from '@devkit/tool-core';
import { SmartRecommendation } from '@devkit/shared';

interface SmartContextPanelProps {
  input: string;
  onSelectAction?: (rec: SmartRecommendation) => void;
  className?: string;
}

export function SmartContextPanel({ input, onSelectAction, className = '' }: SmartContextPanelProps) {
  const router = useRouter();

  const detection = useMemo(() => {
    if (!input || input.trim().length < 4) return null;
    const res = detectSmartContext(input);
    if (res.confidence < 70) return null;
    return res;
  }, [input]);

  if (!detection) return null;

  // Mapping dari detected type ke tab AiAssistantTool
  const AI_TAB_MAP: Record<string, string> = {
    error: 'error',
    stack_trace: 'error',
    jwt: 'error',
    json: 'json',
    sql: 'sql',
    regex: 'regex',
    code: 'code',
  };

  const handleActionClick = (rec: SmartRecommendation) => {
    if (onSelectAction) {
      onSelectAction(rec);
    }

    if (rec.actionType === 'ai') {
      // Build contextual URL: pre-fill tab + input + auto-trigger
      const tab = AI_TAB_MAP[detection.detectedType] || 'error';
      const encodedInput = encodeURIComponent(input.substring(0, 1000));
      router.push(`/tools/ai-assistant?tab=${tab}&input=${encodedInput}&autorun=1`);
    } else if (rec.actionType === 'navigate') {
      router.push(`/tools/${rec.targetToolSlug}`);
    } else if (rec.targetToolSlug === 'pipeline-builder') {
      router.push(`/tools/pipeline-builder?initialInput=${encodeURIComponent(input.substring(0, 500))}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.99 }}
        transition={{ duration: 0.2 }}
        className={`p-4 bg-gradient-to-r from-accent/15 via-surface to-background border border-accent/30 rounded-xl shadow-md space-y-3 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-bold text-devText-primary uppercase tracking-wider">
              Smart Context Detected: <span className="text-accent">{detection.detectedType.toUpperCase()}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-bold">
              {detection.confidence}% Confidence
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Browser Privacy</span>
          </div>
        </div>

        <p className="text-xs text-devText-secondary">{detection.summary}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-devText-muted font-medium mr-1">Recommended Actions:</span>
          {detection.recommendations.map((rec) => (
            <button
              key={rec.id}
              onClick={() => handleActionClick(rec)}
              className="px-3 py-1.5 bg-background border border-border hover:border-accent hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              <span>{rec.label}</span>
              <ArrowRight className="w-3 h-3 text-accent" />
            </button>
          ))}

          <button
            onClick={() =>
              router.push(`/tools/pipeline-builder?initialInput=${encodeURIComponent(input.substring(0, 500))}`)
            }
            className="px-3 py-1.5 bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors ml-auto"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Build Workflow →</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
