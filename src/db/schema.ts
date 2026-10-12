import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

/** A learner's saved preferences. Anonymous demo users get one too; it moves to their account on sign-up. */
export const learnerProfile = pgTable('learner_profile', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  learningStyle: text('learning_style').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
