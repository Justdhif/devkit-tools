'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Plus, Trash2, ArrowRight, Wrench } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { getToolBySlug } from '@devkit/tool-core';
import { AuthGuard } from '../../components/AuthGuard';

export default function WorkspacesPage() {
  const { workspaces, addWorkspace, removeWorkspace } = useDevKitStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addWorkspace(name.trim(), ['json-formatter', 'jwt-decoder', 'uuid-generator'], desc.trim());
    setName('');
    setDesc('');
    setShowModal(false);
  };

  return (
    <AuthGuard title="Saved Workspaces" description="Sign in to create, save, and synchronize curated tool collections for your developer projects.">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-devText-primary">Personal Workspaces</h1>
              <p className="text-xs text-devText-secondary">Organize curated tool sets for specific dev tasks</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="p-5 bg-surface border border-border rounded-xl space-y-4 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-devText-primary">{ws.name}</h3>
                  {ws.description && <p className="text-xs text-devText-secondary mt-1">{ws.description}</p>}
                </div>
                <button
                  onClick={() => removeWorkspace(ws.id)}
                  className="text-devText-muted hover:text-rose-400 p-1"
                  title="Delete workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Included tools list */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="text-[11px] font-semibold text-devText-muted uppercase tracking-wider">
                  Included Tools ({ws.toolSlugs.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ws.toolSlugs.map((slug) => {
                    const tool = getToolBySlug(slug);
                    if (!tool) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/tools/${slug}`}
                        className="p-2 rounded bg-background border border-border hover:border-accent/50 text-xs font-medium text-devText-primary flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{tool.name}</span>
                        <ArrowRight className="w-3 h-3 text-accent shrink-0 ml-1" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for creating new workspace */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreate}
              className="w-full max-w-md bg-surface border border-border rounded-xl p-5 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-devText-primary">Create New Workspace</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-devText-muted block mb-1">Workspace Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Frontend Toolkit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-devText-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-devText-muted block mb-1">Description (Optional)</label>
                  <textarea
                    placeholder="Short description of this workspace..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-background border border-border rounded p-3 text-xs text-devText-primary focus:outline-none focus:border-accent resize-none h-20"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-devText-secondary hover:text-devText-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
