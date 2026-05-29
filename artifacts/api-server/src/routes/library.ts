import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, libraryTable } from "@workspace/db";
import { SaveToLibraryBody, RemoveFromLibraryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/library", async (_req, res): Promise<void> => {
  const entries = await db.select().from(libraryTable).orderBy(libraryTable.savedAt);

  res.json(
    entries.map((e) => ({
      id: e.id,
      trackId: e.trackId,
      title: e.title,
      artist: e.artist,
      album: e.album ?? null,
      artworkUrl: e.artworkUrl,
      previewUrl: e.previewUrl ?? null,
      durationMs: e.durationMs ?? null,
      genre: e.genre ?? null,
      savedAt: e.savedAt.toISOString(),
    }))
  );
});

router.post("/library", async (req, res): Promise<void> => {
  const parsed = SaveToLibraryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(libraryTable)
    .where(eq(libraryTable.trackId, parsed.data.trackId));

  if (existing.length > 0) {
    res.status(201).json({
      id: existing[0].id,
      trackId: existing[0].trackId,
      title: existing[0].title,
      artist: existing[0].artist,
      album: existing[0].album ?? null,
      artworkUrl: existing[0].artworkUrl,
      previewUrl: existing[0].previewUrl ?? null,
      durationMs: existing[0].durationMs ?? null,
      genre: existing[0].genre ?? null,
      savedAt: existing[0].savedAt.toISOString(),
    });
    return;
  }

  const [entry] = await db
    .insert(libraryTable)
    .values({
      trackId: parsed.data.trackId,
      title: parsed.data.title,
      artist: parsed.data.artist,
      album: parsed.data.album ?? null,
      artworkUrl: parsed.data.artworkUrl,
      previewUrl: parsed.data.previewUrl ?? null,
      durationMs: parsed.data.durationMs ?? null,
      genre: parsed.data.genre ?? null,
    })
    .returning();

  res.status(201).json({
    id: entry.id,
    trackId: entry.trackId,
    title: entry.title,
    artist: entry.artist,
    album: entry.album ?? null,
    artworkUrl: entry.artworkUrl,
    previewUrl: entry.previewUrl ?? null,
    durationMs: entry.durationMs ?? null,
    genre: entry.genre ?? null,
    savedAt: entry.savedAt.toISOString(),
  });
});

router.delete("/library/:trackId", async (req, res): Promise<void> => {
  const params = RemoveFromLibraryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(libraryTable).where(eq(libraryTable.trackId, params.data.trackId));
  res.sendStatus(204);
});

export default router;
