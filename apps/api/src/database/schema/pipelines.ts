import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { users } from './users';

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
