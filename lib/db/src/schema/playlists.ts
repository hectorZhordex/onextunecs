import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playlistsTable = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  artworkUrl: text("artwork_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPlaylistSchema = createInsertSchema(playlistsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlistsTable.$inferSelect;

export const playlistTracksTable = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlistsTable.id, { onDelete: "cascade" }),
  trackId: text("track_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  artworkUrl: text("artwork_url").notNull(),
  previewUrl: text("preview_url"),
  durationMs: integer("duration_ms"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracksTable).omit({ id: true, addedAt: true });
export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;
export type PlaylistTrack = typeof playlistTracksTable.$inferSelect;
