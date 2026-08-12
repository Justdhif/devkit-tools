import { pgTable, text, timestamp, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  provider: text('provider').default('email').notNull(),
  providerId: text('provider_id'),
  avatarUrl: text('avatar_url'),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tools = pgTable('tools', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const favorites = pgTable(
  'favorites',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    toolSlug: text('tool_slug').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.toolSlug] }),
  })
);

export const toolHistory = pgTable('tool_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toolSlug: text('tool_slug').notNull(),
  inputSummary: text('input_summary'),
  isSensitive: boolean('is_sensitive').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedWorkspaces = pgTable('saved_workspaces', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceTools = pgTable(
  'workspace_tools',
  {
    workspaceId: text('workspace_id').notNull().references(() => savedWorkspaces.id, { onDelete: 'cascade' }),
    toolSlug: text('tool_slug').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceId, table.toolSlug] }),
  })
);

export const sharedItems = pgTable('shared_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  toolSlug: text('tool_slug').notNull(),
  title: text('title').notNull(),
  configuration: jsonb('configuration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedPipelines = pgTable('saved_pipelines', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  initialInput: text('initial_input'),
  steps: jsonb('steps').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

