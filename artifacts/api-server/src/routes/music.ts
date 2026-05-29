import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ITUNES_BASE = "https://itunes.apple.com";

interface ITunesResult {
  trackId?: number;
  artistId?: number;
  collectionId?: number;
  kind?: string;
  wrapperType?: string;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  releaseDate?: string;
  trackNumber?: number;
}

function mapTrack(r: ITunesResult) {
  return {
    id: String(r.trackId ?? r.artistId ?? Math.random()),
    title: r.trackName ?? "Unknown",
    artist: r.artistName ?? "Unknown",
    album: r.collectionName ?? null,
    artworkUrl: (r.artworkUrl100 ?? r.artworkUrl60 ?? "").replace("100x100", "600x600"),
    previewUrl: r.previewUrl ?? null,
    durationMs: r.trackTimeMillis ?? null,
    genre: r.primaryGenreName ?? null,
    releaseDate: r.releaseDate ?? null,
    trackNumber: r.trackNumber ?? null,
  };
}

function mapArtist(r: ITunesResult) {
  return {
    id: String(r.artistId),
    name: r.artistName ?? "Unknown",
    artworkUrl: null,
    genre: r.primaryGenreName ?? null,
  };
}

function mapAlbum(r: ITunesResult) {
  return {
    id: String(r.collectionId),
    title: r.collectionName ?? "Unknown",
    artist: r.artistName ?? "Unknown",
    artworkUrl: (r.artworkUrl100 ?? r.artworkUrl60 ?? "").replace("100x100", "600x600"),
    releaseDate: r.releaseDate ?? null,
    trackCount: null,
  };
}

router.get("/search", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  const type = String(req.query.type ?? "all");
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  const entity = type === "track" ? "song" : type === "artist" ? "musicArtist" : type === "album" ? "album" : "music";
  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(q)}&media=music&entity=${entity}&limit=${limit}`;

  try {
    const resp = await fetch(url);
    const data = (await resp.json()) as { results: ITunesResult[] };
    const results = data.results ?? [];

    const tracks = results.filter((r) => r.wrapperType === "track" && r.kind === "song").map(mapTrack);
    const artists = results.filter((r) => r.wrapperType === "artist").map(mapArtist);
    const albums = results.filter((r) => r.wrapperType === "collection").map(mapAlbum);

    res.json({ tracks, artists, albums });
  } catch (err) {
    req.log.error({ err }, "iTunes search failed");
    res.json({ tracks: [], artists: [], albums: [] });
  }
});

router.get("/tracks/trending", async (req, res): Promise<void> => {
  const genre = String(req.query.genre ?? "").trim() || "pop";
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(genre)}&media=music&entity=song&limit=${limit}&sort=recent`;

  try {
    const resp = await fetch(url);
    const data = (await resp.json()) as { results: ITunesResult[] };
    const tracks = (data.results ?? []).filter((r) => r.wrapperType === "track").map(mapTrack);
    res.json(tracks);
  } catch (err) {
    req.log.error({ err }, "iTunes trending failed");
    res.json([]);
  }
});

router.get("/tracks/featured", async (req, res): Promise<void> => {
  const queries = ["Taylor Swift", "The Weeknd", "Drake", "Beyonce", "Ed Sheeran"];
  const picked = queries[Math.floor(Math.random() * queries.length)];

  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(picked)}&media=music&entity=song&limit=5`;

  try {
    const resp = await fetch(url);
    const data = (await resp.json()) as { results: ITunesResult[] };
    const tracks = (data.results ?? []).filter((r) => r.wrapperType === "track").map(mapTrack);
    res.json(tracks.slice(0, 5));
  } catch (err) {
    req.log.error({ err }, "iTunes featured failed");
    res.json([]);
  }
});

router.get("/tracks/genres", async (_req, res): Promise<void> => {
  const genres = [
    { id: "pop", name: "Pop", color: "#ff006b" },
    { id: "hip-hop", name: "Hip-Hop", color: "#ff390d" },
    { id: "electronic", name: "Electronic", color: "#9b59b6" },
    { id: "rock", name: "Rock", color: "#e74c3c" },
    { id: "r-n-b", name: "R&B", color: "#e91e8c" },
    { id: "jazz", name: "Jazz", color: "#f39c12" },
    { id: "classical", name: "Classical", color: "#2ecc71" },
    { id: "country", name: "Country", color: "#d35400" },
    { id: "alternative", name: "Alternative", color: "#16a085" },
    { id: "latin", name: "Latin", color: "#c0392b" },
  ];
  res.json(genres);
});

router.get("/tracks/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const url = `${ITUNES_BASE}/lookup?id=${encodeURIComponent(id)}&media=music`;

  try {
    const resp = await fetch(url);
    const data = (await resp.json()) as { results: ITunesResult[] };
    const result = data.results?.[0];
    if (!result) {
      res.status(404).json({ error: "Track not found" });
      return;
    }
    res.json(mapTrack(result));
  } catch (err) {
    req.log.error({ err }, "iTunes lookup failed");
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

export default router;
