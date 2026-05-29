import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, playlistsTable, playlistTracksTable } from "@workspace/db";
import {
  CreatePlaylistBody,
  UpdatePlaylistBody,
  UpdatePlaylistParams,
  GetPlaylistParams,
  DeletePlaylistParams,
  AddTrackToPlaylistBody,
  AddTrackToPlaylistParams,
  RemoveTrackFromPlaylistParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/playlists", async (_req, res): Promise<void> => {
  const playlists = await db.select().from(playlistsTable).orderBy(playlistsTable.createdAt);

  const withCounts = await Promise.all(
    playlists.map(async (p) => {
      const [row] = await db
        .select({ count: count() })
        .from(playlistTracksTable)
        .where(eq(playlistTracksTable.playlistId, p.id));
      return {
        id: p.id,
        name: p.name,
        description: p.description ?? null,
        artworkUrl: p.artworkUrl ?? null,
        trackCount: Number(row?.count ?? 0),
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  res.json(withCounts);
});

router.post("/playlists", async (req, res): Promise<void> => {
  const parsed = CreatePlaylistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [playlist] = await db
    .insert(playlistsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      artworkUrl: parsed.data.artworkUrl ?? null,
    })
    .returning();

  res.status(201).json({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
    artworkUrl: playlist.artworkUrl ?? null,
    trackCount: 0,
    createdAt: playlist.createdAt.toISOString(),
  });
});

router.get("/playlists/:id", async (req, res): Promise<void> => {
  const params = GetPlaylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [playlist] = await db
    .select()
    .from(playlistsTable)
    .where(eq(playlistsTable.id, params.data.id));

  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

  const tracks = await db
    .select()
    .from(playlistTracksTable)
    .where(eq(playlistTracksTable.playlistId, params.data.id))
    .orderBy(playlistTracksTable.addedAt);

  res.json({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
    artworkUrl: playlist.artworkUrl ?? null,
    createdAt: playlist.createdAt.toISOString(),
    tracks: tracks.map((t) => ({
      id: t.id,
      playlistId: t.playlistId,
      trackId: t.trackId,
      title: t.title,
      artist: t.artist,
      album: t.album ?? null,
      artworkUrl: t.artworkUrl,
      previewUrl: t.previewUrl ?? null,
      durationMs: t.durationMs ?? null,
      addedAt: t.addedAt.toISOString(),
    })),
  });
});

router.patch("/playlists/:id", async (req, res): Promise<void> => {
  const params = UpdatePlaylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePlaylistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.artworkUrl !== undefined) updates.artworkUrl = parsed.data.artworkUrl;

  const [playlist] = await db
    .update(playlistsTable)
    .set(updates)
    .where(eq(playlistsTable.id, params.data.id))
    .returning();

  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

  const [row] = await db
    .select({ count: count() })
    .from(playlistTracksTable)
    .where(eq(playlistTracksTable.playlistId, playlist.id));

  res.json({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
    artworkUrl: playlist.artworkUrl ?? null,
    trackCount: Number(row?.count ?? 0),
    createdAt: playlist.createdAt.toISOString(),
  });
});

router.delete("/playlists/:id", async (req, res): Promise<void> => {
  const params = DeletePlaylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(playlistsTable).where(eq(playlistsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/playlists/:id/tracks", async (req, res): Promise<void> => {
  const params = AddTrackToPlaylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddTrackToPlaylistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [track] = await db
    .insert(playlistTracksTable)
    .values({
      playlistId: params.data.id,
      trackId: parsed.data.trackId,
      title: parsed.data.title,
      artist: parsed.data.artist,
      album: parsed.data.album ?? null,
      artworkUrl: parsed.data.artworkUrl,
      previewUrl: parsed.data.previewUrl ?? null,
      durationMs: parsed.data.durationMs ?? null,
    })
    .returning();

  res.status(201).json({
    id: track.id,
    playlistId: track.playlistId,
    trackId: track.trackId,
    title: track.title,
    artist: track.artist,
    album: track.album ?? null,
    artworkUrl: track.artworkUrl,
    previewUrl: track.previewUrl ?? null,
    durationMs: track.durationMs ?? null,
    addedAt: track.addedAt.toISOString(),
  });
});

router.delete("/playlists/:id/tracks/:trackId", async (req, res): Promise<void> => {
  const params = RemoveTrackFromPlaylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(playlistTracksTable)
    .where(
      eq(playlistTracksTable.playlistId, params.data.id) &&
        eq(playlistTracksTable.trackId, params.data.trackId)
    );

  res.sendStatus(204);
});

export default router;
