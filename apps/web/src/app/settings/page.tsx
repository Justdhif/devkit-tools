'use client';

import React from 'react';
import { Settings, Shield, Monitor, Sliders, Check } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';

export default function SettingsPage() {
  const { settings, updateSettings, clearHistory } = useDevKitStore();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-devText-primary">DevKit Settings</h1>
          <p className="text-xs text-devText-secondary">Configure appearance, editor preferences, and privacy rules</p>
        </div>
      </div>

      <section className="p-5 bg-surface border border-border rounded-xl space-y-4">
        <h2 className="text-base font-bold text-devText-primary flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-accent" />
          <span>Editor & Behavior</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-devText-muted block mb-1">Editor Font Size (px)</label>
            <input
              type="number"
              value={settings.editor.fontSize}
              onChange={(e) =>
                updateSettings({
                  editor: { ...settings.editor, fontSize: Number(e.target.value) },
                })
              }
              className="w-full bg-background border border-border text-devText-primary rounded px-3 py-1.5 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-devText-muted block mb-1">Tab Size (Spaces)</label>
            <select
              value={settings.editor.tabSize}
              onChange={(e) =>
                updateSettings({
                  editor: { ...settings.editor, tabSize: Number(e.target.value) },
                })
              }
              className="w-full bg-background border border-border text-devText-primary rounded px-3 py-1.5 focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-devText-primary">
            <input
              type="checkbox"
              checked={settings.behavior.autoFormat}
              onChange={(e) =>
                updateSettings({
                  behavior: { ...settings.behavior, autoFormat: e.target.checked },
                })
              }
              className="rounded accent-accent"
            />
            <span>Auto-format input on paste when valid</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-devText-primary">
            <input
              type="checkbox"
              checked={settings.behavior.confirmBeforeClear}
              onChange={(e) =>
                updateSettings({
                  behavior: { ...settings.behavior, confirmBeforeClear: e.target.checked },
                })
              }
              className="rounded accent-accent"
            />
            <span>Confirm before clearing editor contents</span>
          </label>
        </div>
      </section>

      <section className="p-5 bg-surface border border-border rounded-xl space-y-4">
        <h2 className="text-base font-bold text-devText-primary flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Data Management</span>
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-devText-primary">
            <input
              type="checkbox"
              checked={settings.privacy.saveHistory}
              onChange={(e) =>
                updateSettings({
                  privacy: { ...settings.privacy, saveHistory: e.target.checked },
                })
              }
              className="rounded accent-accent"
            />
            <span>Save local tool history in browser storage</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-devText-primary">
            <input
              type="checkbox"
              checked={settings.privacy.donotSaveSensitive}
              onChange={(e) =>
                updateSettings({
                  privacy: { ...settings.privacy, donotSaveSensitive: e.target.checked },
                })
              }
              className="rounded accent-accent"
            />
            <span>Never save sensitive values (JWTs, tokens, secrets) to history</span>
          </label>
        </div>

        <div className="pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-devText-muted">Stored local history data</span>
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold rounded-md transition-colors"
          >
            Clear Stored History
          </button>
        </div>
      </section>
    </div>
  );
}
