import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

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
