import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historyTable = pgTable("history", {
  id: serial("id").primaryKey(),
  trackId: text("track_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  artworkUrl: text("artwork_url").notNull(),
  previewUrl: text("preview_url"),
  durationMs: integer("duration_ms"),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHistorySchema = createInsertSchema(historyTable).omit({ id: true, playedAt: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type HistoryEntry = typeof historyTable.$inferSelect;
