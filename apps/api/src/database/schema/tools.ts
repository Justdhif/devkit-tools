import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

export const tools = pgTable('tools', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name'),
  isPopular: boolean('is_popular').default(false),
  isNew: boolean('is_new').default(false),
  keywords: text('keywords'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

