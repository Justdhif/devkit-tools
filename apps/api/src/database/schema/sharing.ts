import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sharedItems = pgTable('shared_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  toolSlug: text('tool_slug').notNull(),
  title: text('title').notNull(),
  configuration: jsonb('configuration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
