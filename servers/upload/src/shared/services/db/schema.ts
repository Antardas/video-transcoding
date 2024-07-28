import { bigserial, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
	id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	url: text('url').notNull(),
});

export type Video = typeof videos.$inferSelect; // return type when queried
export type NewVideo = typeof videos.$inferInsert; // insert type
