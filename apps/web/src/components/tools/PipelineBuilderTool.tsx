'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  FolderOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { PipelineStep, ToolPipeline } from '@devkit/shared';
import { CORE_TOOLS, validatePipeline, executePipeline, executeSingleStep } from '@devkit/tool-core';
import { useDevKitStore } from '../../store/useDevKitStore';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

const PREBUILT_PRESETS: { id: string; name: string; description: string; initialInput: string; steps: PipelineStep[] }[] = [

  {
    id: 'prebuilt-jwt',
    name: 'JWT Inspector & TypeScript',
    description: 'Decodes JWT token -> Formats Payload JSON -> Generates TypeScript Interfaces',
    initialInput: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldktpdCBVc2VyIiwicm9sZSI6ImRldmVsb3BlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    steps: [
      { id: 'step-jwt-1', toolSlug: 'jwt-decoder', toolName: 'JWT Decoder & Inspector', inputType: 'jwt', outputType: 'json', status: 'idle' },
      { id: 'step-jwt-2', toolSlug: 'json-formatter', toolName: 'JSON Formatter / Validator', inputType: 'json', outputType: 'json', status: 'idle' },
      { id: 'step-jwt-3', toolSlug: 'json-to-typescript', toolName: 'JSON → TypeScript Generator', inputType: 'json', outputType: 'typescript', status: 'idle' },
    ],
  },
  {
    id: 'prebuilt-zod',
    name: 'API Response Zod Schema',
    description: 'Executes HTTP Request -> Formats JSON Response -> Generates Zod Schema',
    initialInput: '{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "userId": 42,\n    "username": "devkit_admin",\n    "active": true\n  }\n}',
    steps: [
      { id: 'step-zod-1', toolSlug: 'json-formatter', toolName: 'JSON Formatter / Validator', inputType: 'json', outputType: 'json', status: 'idle' },
      { id: 'step-zod-2', toolSlug: 'json-to-typescript', toolName: 'JSON → Zod Schema', inputType: 'json', outputType: 'typescript', config: { targetLanguage: 'zod' }, status: 'idle' },
    ],
  },
  {
    id: 'prebuilt-url',
    name: 'URL & Base64 Payload Extractor',
    description: 'Decodes URL Query String -> Decodes Base64 String -> Formats JSON',
    initialInput: 'eyJ1c2VySWQiOjEwMSwibmFtZSI6IkFsaWNlIn0=',
    steps: [
      { id: 'step-url-1', toolSlug: 'base64-encoder', toolName: 'Base64 Decoder', inputType: 'base64', outputType: 'string', config: { mode: 'decode' }, status: 'idle' },
      { id: 'step-url-2', toolSlug: 'json-formatter', toolName: 'JSON Formatter', inputType: 'json', outputType: 'json', status: 'idle' },
    ],
  },
];

export function PipelineBuilderTool() {
  const searchParams = useSearchParams();
  const paramInput = searchParams.get('initialInput') || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    savedPipelines,
    fetchPipelinesFromDB,
    savePipelineToDB,
    deletePipelineFromDB,
    addHistoryItem,
  } = useDevKitStore();

  const [input, setInput] = useState(
    paramInput || PREBUILT_PRESETS[0].initialInput
  );

  const [steps, setSteps] = useState<PipelineStep[]>(PREBUILT_PRESETS[0].steps);
  const [pipelineName, setPipelineName] = useState(PREBUILT_PRESETS[0].name);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  const [running, setRunning] = useState(false);
  const [runningStepId, setRunningStepId] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [selectedToolSlug, setSelectedToolSlug] = useState('json-formatter');


  // Save Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [savingLoading, setSavingLoading] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const validation = validatePipeline(steps);

  useEffect(() => {
    fetchPipelinesFromDB();
  }, [fetchPipelinesFromDB]);

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
        addHistoryItem('pipeline-builder', `Executed Pipeline: ${pipelineName}`);
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

  // Open Save Modal
  const handleOpenSaveModal = () => {
    setSaveName(pipelineName || 'My Custom Pipeline');
    setSaveDesc('');
    setSaveStatusMessage(null);
    setIsSaveModalOpen(true);
  };

  // Submit Save to Neon DB
  const handleSaveToDatabase = async () => {
    if (!saveName.trim()) return;
    setSavingLoading(true);
    setSaveStatusMessage(null);

    const cleanSteps = steps.map((s) => ({
      id: s.id,
      toolSlug: s.toolSlug,
      toolName: s.toolName,
      inputType: s.inputType,
      outputType: s.outputType,
      config: s.config,
    }));

    const res = await savePipelineToDB({
      name: saveName.trim(),
      description: saveDesc.trim() || undefined,
      initialInput: input,
      steps: cleanSteps,
    });

    setSavingLoading(false);
    if (res.success) {
      setPipelineName(saveName.trim());
      setSaveStatusMessage('Saved directly to Neon DB!');
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveStatusMessage(null);
      }, 1500);
    } else {
      setSaveStatusMessage(res.error || 'Failed to save to database');
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    // Check prebuilt presets
    const pre = PREBUILT_PRESETS.find((p) => p.id === presetId);
    if (pre) {
      setPipelineName(pre.name);
      setInput(pre.initialInput);
      setSteps(pre.steps.map((s) => ({ ...s, status: 'idle', output: undefined })));
      return;
    }

    // Check user DB saved presets
    const userPreset = savedPipelines.find((p) => p.id === presetId);
    if (userPreset) {
      setPipelineName(userPreset.name);
      if (userPreset.initialInput) setInput(userPreset.initialInput);
      setSteps(userPreset.steps.map((s) => ({ ...s, status: 'idle', output: undefined })));
    }
  };


  const handleDeleteUserPipeline = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deletePipelineFromDB(id);
  };

  const handleExportJSON = () => {
    const exportData = {
      name: pipelineName,
      initialInput: input,
      steps: steps.map((s) => ({
        id: s.id,
        toolSlug: s.toolSlug,
        toolName: s.toolName,
        inputType: s.inputType,
        outputType: s.outputType,
        config: s.config,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pipelineName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pipeline.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.name) setPipelineName(json.name);
        if (json.initialInput) setInput(json.initialInput);
        if (Array.isArray(json.steps)) {
          setSteps(
            json.steps.map((s: any) => ({
              id: s.id || `step-${Date.now()}`,
              toolSlug: s.toolSlug,
              toolName: s.toolName || s.toolSlug,
              inputType: s.inputType || 'string',
              outputType: s.outputType || 'string',
              config: s.config,
              status: 'idle',
            }))
          );
        }
      } catch (err) {
        alert('Invalid pipeline JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(stepId);
    setTimeout(() => setCopiedStepId(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Hidden File Input for Import JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <GitMerge className="w-5 h-5 text-accent shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-devText-primary">{pipelineName}</h2>
            <p className="text-xs text-devText-secondary">
              Chain multiple tools into automated pipelines saved directly to Neon DB.
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-auto gap-2.5">
          {/* Preset Selector Dropdown - Full Width on Mobile */}
          <div className="w-full sm:w-64">
            <Select value={selectedPresetId} onValueChange={handleSelectPreset}>
              <SelectTrigger className="w-full text-xs bg-background border-border">
                <FolderOpen className="w-3.5 h-3.5 text-accent mr-1 shrink-0" />
                <SelectValue placeholder="Load Preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectLabel>Pre-built Workflows</SelectLabel>
                {PREBUILT_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}

                <SelectLabel className="border-t border-border mt-1 pt-1 text-accent">
                  Neon DB Saved Pipelines ({savedPipelines.length})
                </SelectLabel>
                {savedPipelines.length > 0 ? (
                  savedPipelines.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_empty" disabled className="text-[11px] italic text-devText-muted">
                    No custom presets in Neon DB
                  </SelectItem>
                )}
              </SelectContent>


            </Select>
          </div>


          {/* Action Buttons Row: Export, Import, Save, Run */}
          <div className="flex flex-wrap items-center gap-2 w-full">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Export Pipeline as JSON file"
              className="flex-1 sm:flex-none px-2.5 py-2 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-devText-secondary" />
              <span>Export</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Pipeline from JSON file"
              className="flex-1 sm:flex-none px-2.5 py-2 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-devText-secondary" />
              <span>Import</span>
            </button>

            {/* Save to DB */}
            <button
              onClick={handleOpenSaveModal}
              className="flex-1 sm:flex-none px-3 py-2 bg-background border border-border hover:bg-surface text-devText-primary text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4 text-accent" />
              <span>
                <span className="hidden sm:inline">Save Preset</span>
                <span className="sm:hidden">Save</span>
              </span>
            </button>

            {/* Run Pipeline */}
            <button
              onClick={handleRunPipeline}
              disabled={running || !validation.valid || !input.trim()}
              className="flex-1 sm:flex-none px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>
                <span className="hidden sm:inline">Run Complete Pipeline</span>
                <span className="sm:hidden">Run</span>
              </span>
            </button>
          </div>
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

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 pb-24 sm:pb-4">
        <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden p-3 space-y-2">
          <span className="text-xs font-semibold text-devText-muted uppercase tracking-wider">
            Pipeline Initial Input
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter initial string data (JSON, JWT, URL, SQL, etc.)..."
            className="flex-1 w-full p-3 bg-background border border-border rounded text-devText-primary font-mono text-xs focus:outline-none resize-none min-h-[220px] sm:min-h-[300px]"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col border border-border rounded-lg bg-surface overflow-hidden p-3 sm:p-4 space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-xs font-semibold text-devText-muted uppercase tracking-wider shrink-0">
              Pipeline Steps ({steps.length})
            </h3>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Select value={selectedToolSlug} onValueChange={(val) => setSelectedToolSlug(val)}>
                <SelectTrigger className="flex-1 sm:w-48 text-xs">
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
                className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-accent text-xs font-semibold rounded-lg flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  <span className="hidden xs:inline">Add Step</span>
                  <span className="xs:hidden">Add</span>
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-background/50 border border-dashed border-border rounded-xl text-center space-y-3 my-2">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <GitMerge className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-devText-primary">
                    No Pipeline Steps Configured
                  </h4>
                  <p className="text-xs text-devText-secondary max-w-sm">
                    Select a preset from the dropdown above or pick a tool and click &quot;Add Step&quot; to build your automated pipeline.
                  </p>
                </div>
                <button
                  onClick={handleAddStep}
                  className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Step</span>
                </button>
              </div>
            ) : (
              steps.map((step, idx) => (

              <React.Fragment key={step.id}>
                <div className="p-3 bg-background border border-border rounded-xl space-y-2 relative">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-devText-primary">{step.toolName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sidebar border border-border text-devText-muted shrink-0">
                        {step.inputType} → {step.outputType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-auto sm:ml-0">
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
                        <span>
                          <span className="hidden sm:inline">Run Step</span>
                          <span className="sm:hidden">Run</span>
                        </span>
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
            ))
            )}
          </div>

        </div>
      </div>

      {/* Save Preset to Neon DB Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 text-devText-muted hover:text-devText-primary"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <Save className="w-5 h-5 text-accent" />
              <div>
                <h3 className="text-sm font-bold text-devText-primary">Save Preset to Neon Database</h3>
                <p className="text-xs text-devText-secondary">Stores your pipeline steps permanently in Neon DB.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-devText-muted font-semibold mb-1">Pipeline Preset Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. My API Debugger Chain"
                  className="w-full p-2.5 bg-background border border-border rounded text-devText-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-devText-muted font-semibold mb-1">Description (Optional)</label>
                <textarea
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="Briefly describe what this pipeline chain does..."
                  className="w-full p-2.5 bg-background border border-border rounded text-devText-primary focus:outline-none focus:border-accent h-20 resize-none"
                />
              </div>
            </div>

            {saveStatusMessage && (
              <p
                className={`text-xs ${
                  saveStatusMessage.includes('SUCCESS') || saveStatusMessage.includes('Saved')
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {saveStatusMessage}
              </p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3 py-1.5 bg-background border border-border hover:bg-surface text-devText-primary text-xs rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveToDatabase}
                disabled={savingLoading || !saveName.trim()}
                className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 disabled:opacity-50"
              >
                {savingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Save to Neon DB</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
