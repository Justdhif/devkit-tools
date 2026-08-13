import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const tools = pgTable('tools', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
