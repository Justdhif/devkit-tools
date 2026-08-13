import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { users } from './users';

export const toolHistory = pgTable('tool_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toolSlug: text('tool_slug').notNull(),
  inputSummary: text('input_summary'),
  isSensitive: boolean('is_sensitive').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
