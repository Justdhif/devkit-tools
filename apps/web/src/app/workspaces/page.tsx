'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { getToolBySlug } from '@devkit/tool-core';
import { AuthGuard } from '../../components/AuthGuard';
import { Button } from '../../components/ui/button';
import { Input, Textarea } from '../../components/ui/input';

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
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-devText-primary">Workspaces</h1>
              <p className="text-xs text-devText-secondary">Organize curated tool sets for specific dev tasks</p>
            </div>
          </div>

          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Workspace</span>
          </Button>
        </div>

        {workspaces.length === 0 ? (
          <div className="p-12 border border-border bg-surface rounded-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <LayoutGrid className="w-7 h-7 text-accent" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-devText-primary">No Workspaces Yet</h3>
              <p className="text-xs text-devText-muted max-w-sm mx-auto">
                Create your first workspace to group and organize your favorite developer tools for specific projects or workflows.
              </p>
            </div>
            <Button onClick={() => setShowModal(true)} className="mx-auto">
              <Plus className="w-4 h-4" />
              <span>Create First Workspace</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="p-5 bg-surface border border-border rounded-xl space-y-4 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-devText-primary truncate">{ws.name}</h3>
                    {ws.description && <p className="text-xs text-devText-secondary mt-1 line-clamp-2">{ws.description}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWorkspace(ws.id)}
                    className="shrink-0 text-devText-muted hover:text-rose-400 hover:bg-rose-950/30"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

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
        )}

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
                  <Input
                    type="text"
                    required
                    placeholder="e.g. My Frontend Toolkit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-devText-muted block mb-1">Description (Optional)</label>
                  <Textarea
                    placeholder="Short description of this workspace..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Workspace
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
