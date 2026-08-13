import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

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
