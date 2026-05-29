import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const libraryTable = pgTable("library", {
  id: serial("id").primaryKey(),
  trackId: text("track_id").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  artworkUrl: text("artwork_url").notNull(),
  previewUrl: text("preview_url"),
  durationMs: integer("duration_ms"),
  genre: text("genre"),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLibrarySchema = createInsertSchema(libraryTable).omit({ id: true, savedAt: true });
export type InsertLibrary = z.infer<typeof insertLibrarySchema>;
export type LibraryEntry = typeof libraryTable.$inferSelect;
