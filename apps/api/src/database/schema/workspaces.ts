import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { users } from './users';

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
