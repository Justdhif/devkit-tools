'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GitMerge,
  Plus,
  Play,
  Trash2,
  ArrowDown,
  ArrowUp,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  CopyPlus,
  Save,
} from 'lucide-react';
import { PipelineStep } from '@devkit/shared';
import { CORE_TOOLS, validatePipeline, executePipeline, executeSingleStep } from '@devkit/tool-core';
import { useDevKitStore } from '../../store/useDevKitStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function PipelineBuilderTool() {
  const searchParams = useSearchParams();
  const paramInput = searchParams.get('initialInput') || '';

  const [input, setInput] = useState(
    paramInput ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldktpdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'step-1',
      toolSlug: 'jwt-decoder',
      toolName: 'JWT Decoder & Inspector',
      inputType: 'jwt',
      outputType: 'json',
      status: 'idle',
    },
    {
      id: 'step-2',
      toolSlug: 'json-formatter',
      toolName: 'JSON Formatter / Validator',
      inputType: 'json',
      outputType: 'json',
      status: 'idle',
    },
    {
      id: 'step-3',
      toolSlug: 'json-to-typescript',
      toolName: 'JSON → TypeScript Generator',
      inputType: 'json',
      outputType: 'typescript',
      status: 'idle',
    },
  ]);

  const [running, setRunning] = useState(false);
  const [runningStepId, setRunningStepId] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedToolSlug, setSelectedToolSlug] = useState('json-formatter');
  const { addHistoryItem } = useDevKitStore();

  const validation = validatePipeline(steps);

  const handleAddStep = () => {
    const targetTool = CORE_TOOLS.find((t) => t.slug === selectedToolSlug);
    if (!targetTool) return;

    const newStep: PipelineStep = {
      id: `step-${Date.now()}`,
      toolSlug: targetTool.slug,
      toolName: targetTool.name,
      inputType: targetTool.inputType || 'string',
      outputType: targetTool.outputType || 'string',
      status: 'idle',
    };

    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
  };

  const handleDuplicateStep = (step: PipelineStep) => {
    const dup: PipelineStep = {
      ...step,
      id: `step-${Date.now()}`,
      status: 'idle',
      output: undefined,
      error: undefined,
    };
    setSteps([...steps, dup]);
  };

  const handleRunSingleStep = async (stepId: string, index: number) => {
    const step = steps[index];
    if (!step) return;

    setRunningStepId(stepId);
    setPipelineError(null);

    // Determines input data from previous step's output or initial input
    const stepInput = index === 0 ? input : steps[index - 1].output || input;

    try {
      const output = await executeSingleStep(step, stepInput);
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'success', output, error: undefined } : s))
      );
    } catch (err: any) {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: 'error', error: err.message } : s))
      );
    } finally {
      setRunningStepId(null);
    }
  };

  const handleRunPipeline = async () => {
    if (!validation.valid || !input.trim()) return;
    setRunning(true);
    setPipelineError(null);

    setSteps((prev) => prev.map((s) => ({ ...s, status: 'running', error: undefined })));

    try {
      const res = await executePipeline(steps, input);
      if (res.success) {
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: 'success',
            output: res.results[s.id],
          }))
        );
        addHistoryItem('pipeline-builder', `Pipeline executed: ${steps.map((s) => s.toolName).join(' → ')}`);
      } else {
        setPipelineError(res.error || 'Pipeline execution failed.');
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: res.results[s.id] ? 'success' : 'error',
            output: res.results[s.id],
          }))
        );
      }
    } catch (err: any) {
      setPipelineError(err.message || 'Pipeline execution error.');
    } finally {
      setRunning(false);
    }
  };

  const handleSavePipeline = () => {
    addHistoryItem('pipeline-builder', `Saved Pipeline Preset: ${steps.map((s) => s.toolName).join(' → ')}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(stepId);
    setTimeout(() => setCopiedStepId(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <GitMerge className="w-5 h-5 text-accent" />
          <div>
            <h2 className="text-sm font-semibold text-devText-primary">Tool Chaining & Pipeline Builder</h2>
            <p className="text-xs text-devText-secondary">
              Connect output from one tool as input for the next in automated workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSavePipeline}
            className="px-3 py-2 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-accent" />}
            <span>
              {savedSuccess ? (
                'Saved!'
              ) : (
                <>
                  <span className="hidden sm:inline">Save Preset</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </span>
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={running || !validation.valid || !input.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>
              <span className="hidden sm:inline">Run Complete Pipeline</span>
              <span className="sm:hidden">Run</span>
            </span>
          </button>
        </div>

      </div>

      {!validation.valid && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <span className="font-bold">Incompatible Pipeline Chain:</span>
            {validation.errors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {pipelineError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{pipelineError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden p-3 space-y-2">
          <span className="text-xs font-semibold text-devText-muted uppercase tracking-wider">
            Pipeline Initial Input
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter initial string data (JSON, JWT, URL, SQL, etc.)..."
            className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[300px]"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col border border-border rounded-lg bg-surface overflow-hidden p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-devText-muted uppercase tracking-wider">
              Pipeline Steps ({steps.length})
            </h3>

            <div className="flex items-center space-x-2">
              <Select value={selectedToolSlug} onValueChange={(val) => setSelectedToolSlug(val)}>
                <SelectTrigger className="w-48 text-xs">
                  <SelectValue placeholder="Choose Tool" />
                </SelectTrigger>
                <SelectContent>
                  {CORE_TOOLS.map((t) => (
                    <SelectItem key={t.slug} value={t.slug}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleAddStep}
                className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-accent text-xs font-semibold rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="p-3 bg-background border border-border rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-devText-primary">{step.toolName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sidebar border border-border text-devText-muted">
                        {step.inputType} → {step.outputType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleRunSingleStep(step.id, idx)}
                        disabled={runningStepId === step.id}
                        title="Run this step individually"
                        className="px-2 py-1 bg-surface border border-border hover:border-accent text-[11px] font-medium text-devText-primary rounded flex items-center space-x-1 transition-colors"
                      >
                        {runningStepId === step.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-accent" />
                        ) : (
                          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        )}
                        <span>Run Step</span>
                      </button>

                      <button
                        onClick={() => handleMoveStep(idx, 'up')}
                        disabled={idx === 0}
                        title="Move step up"
                        className="p-1 text-devText-muted hover:text-devText-primary disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveStep(idx, 'down')}
                        disabled={idx === steps.length - 1}
                        title="Move step down"
                        className="p-1 text-devText-muted hover:text-devText-primary disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicateStep(step)}
                        title="Duplicate step"
                        className="p-1 text-devText-muted hover:text-accent"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>

                      {step.status === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
                      {step.status === 'running' && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                      {step.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}

                      <button
                        onClick={() => handleRemoveStep(step.id)}
                        title="Delete step"
                        className="text-devText-muted hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {step.output && (
                    <div className="pt-1">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-devText-muted mb-1">
                        <span>Intermediate Step Output:</span>
                        <button
                          onClick={() => handleCopy(step.output!, step.id)}
                          className="hover:text-accent flex items-center space-x-1"
                        >
                          {copiedStepId === step.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 bg-surface border border-border rounded text-[11px] font-mono text-emerald-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {step.output}
                      </pre>
                    </div>
                  )}

                  {step.error && (
                    <div className="pt-1 text-[11px] text-rose-400 font-mono">
                      Error: {step.error}
                    </div>
                  )}
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-accent/60 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
