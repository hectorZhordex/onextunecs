import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, historyTable } from "@workspace/db";
import { AddToHistoryBody, GetHistoryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const queryParams = GetHistoryQueryParams.safeParse(req.query);
  const limit = queryParams.success ? (queryParams.data.limit ?? 20) : 20;

  const entries = await db
    .select()
    .from(historyTable)
    .orderBy(desc(historyTable.playedAt))
    .limit(limit);

  res.json(
    entries.map((e) => ({
      id: e.id,
      trackId: e.trackId,
      title: e.title,
      artist: e.artist,
      artworkUrl: e.artworkUrl,
      previewUrl: e.previewUrl ?? null,
      durationMs: e.durationMs ?? null,
      playedAt: e.playedAt.toISOString(),
    }))
  );
});

router.post("/history", async (req, res): Promise<void> => {
  const parsed = AddToHistoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .insert(historyTable)
    .values({
      trackId: parsed.data.trackId,
      title: parsed.data.title,
      artist: parsed.data.artist,
      artworkUrl: parsed.data.artworkUrl,
      previewUrl: parsed.data.previewUrl ?? null,
      durationMs: parsed.data.durationMs ?? null,
    })
    .returning();

  res.status(201).json({
    id: entry.id,
    trackId: entry.trackId,
    title: entry.title,
    artist: entry.artist,
    artworkUrl: entry.artworkUrl,
    previewUrl: entry.previewUrl ?? null,
    durationMs: entry.durationMs ?? null,
    playedAt: entry.playedAt.toISOString(),
  });
});

router.get("/stats", async (_req, res): Promise<void> => {
  const allHistory = await db.select().from(historyTable);

  const totalPlays = allHistory.length;

  const artistCounts: Record<string, { count: number; artworkUrl: string | null }> = {};
  for (const entry of allHistory) {
    if (!artistCounts[entry.artist]) {
      artistCounts[entry.artist] = { count: 0, artworkUrl: null };
    }
    artistCounts[entry.artist].count++;
    if (!artistCounts[entry.artist].artworkUrl) {
      artistCounts[entry.artist].artworkUrl = entry.artworkUrl;
    }
  }

  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([artist, data]) => ({ artist, count: data.count, artworkUrl: data.artworkUrl }));

  res.json({
    totalPlays,
    topGenres: [],
    topArtists,
  });
});

export default router;
