import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ITUNES_BASE = "https://itunes.apple.com";
const DEEZER_BASE = "https://api.deezer.com";

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
  trackCount?: number;
}

interface DeezerTrack {
  id: number;
  title: string;
  artist: { id: number; name: string; picture_medium?: string };
  album: { id: number; title: string; cover_medium?: string; cover_big?: string };
  duration: number;
  preview?: string;
}

interface DeezerArtist {
  id: number;
  name: string;
  picture_medium?: string;
  nb_fan?: number;
}

interface DeezerAlbum {
  id: number;
  title: string;
  artist: { id: number; name: string };
  cover_medium?: string;
  cover_big?: string;
  release_date?: string;
  nb_tracks?: number;
}

function mapItunesTrack(r: ITunesResult) {
  const art = (r.artworkUrl100 ?? r.artworkUrl60 ?? "").replace("100x100bb", "600x600bb");
  return {
    id: `itunes-${r.trackId}`,
    title: r.trackName ?? "Unknown",
    artist: r.artistName ?? "Unknown",
    album: r.collectionName ?? null,
    artworkUrl: art,
    previewUrl: r.previewUrl ?? null,
    durationMs: r.trackTimeMillis ?? null,
    genre: r.primaryGenreName ?? null,
    releaseDate: r.releaseDate ?? null,
    trackNumber: r.trackNumber ?? null,
  };
}

function mapItunesArtist(r: ITunesResult) {
  return {
    id: `itunes-artist-${r.artistId}`,
    name: r.artistName ?? "Unknown",
    artworkUrl: null,
    genre: r.primaryGenreName ?? null,
  };
}

function mapItunesAlbum(r: ITunesResult) {
  const art = (r.artworkUrl100 ?? r.artworkUrl60 ?? "").replace("100x100bb", "600x600bb");
  return {
    id: `itunes-album-${r.collectionId}`,
    title: r.collectionName ?? "Unknown",
    artist: r.artistName ?? "Unknown",
    artworkUrl: art,
    releaseDate: r.releaseDate ?? null,
    trackCount: r.trackCount ?? null,
  };
}

function mapDeezerTrack(r: DeezerTrack) {
  return {
    id: `deezer-${r.id}`,
    title: r.title,
    artist: r.artist?.name ?? "Unknown",
    album: r.album?.title ?? null,
    artworkUrl: r.album?.cover_big ?? r.album?.cover_medium ?? "",
    previewUrl: r.preview ?? null,
    durationMs: r.duration ? r.duration * 1000 : null,
    genre: null,
    releaseDate: null,
    trackNumber: null,
  };
}

function mapDeezerArtist(r: DeezerArtist) {
  return {
    id: `deezer-artist-${r.id}`,
    name: r.name,
    artworkUrl: r.picture_medium ?? null,
    genre: null,
  };
}

function mapDeezerAlbum(r: DeezerAlbum) {
  return {
    id: `deezer-album-${r.id}`,
    title: r.title,
    artist: r.artist?.name ?? "Unknown",
    artworkUrl: r.cover_big ?? r.cover_medium ?? null,
    releaseDate: r.release_date ?? null,
    trackCount: r.nb_tracks ?? null,
  };
}

async function searchItunes(q: string, entity: string, limit: number): Promise<ITunesResult[]> {
  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(q)}&media=music&entity=${entity}&limit=${limit}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const data = (await resp.json()) as { results?: ITunesResult[] };
  return data.results ?? [];
}

async function searchDeezer(q: string, type: "track" | "artist" | "album", limit: number): Promise<unknown[]> {
  const url = `${DEEZER_BASE}/search/${type}?q=${encodeURIComponent(q)}&limit=${limit}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const data = (await resp.json()) as { data?: unknown[] };
  return data.data ?? [];
}

router.get("/search", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  const type = String(req.query.type ?? "all");
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  try {
    if (type === "track") {
      const [itunesSongs, deezerTracks] = await Promise.allSettled([
        searchItunes(q, "song", Math.ceil(limit / 2)),
        searchDeezer(q, "track", Math.floor(limit / 2)),
      ]);
      const tracks = [
        ...(itunesSongs.status === "fulfilled" ? itunesSongs.value.filter(r => r.wrapperType === "track").map(mapItunesTrack) : []),
        ...(deezerTracks.status === "fulfilled" ? (deezerTracks.value as DeezerTrack[]).map(mapDeezerTrack) : []),
      ].slice(0, limit);
      res.json({ tracks, artists: [], albums: [] });
      return;
    }

    if (type === "artist") {
      const [itunesArtists, deezerArtists] = await Promise.allSettled([
        searchItunes(q, "musicArtist", Math.ceil(limit / 2)),
        searchDeezer(q, "artist", Math.floor(limit / 2)),
      ]);
      const artists = [
        ...(itunesArtists.status === "fulfilled" ? itunesArtists.value.filter(r => r.wrapperType === "artist").map(mapItunesArtist) : []),
        ...(deezerArtists.status === "fulfilled" ? (deezerArtists.value as DeezerArtist[]).map(mapDeezerArtist) : []),
      ].slice(0, limit);
      res.json({ tracks: [], artists, albums: [] });
      return;
    }

    if (type === "album") {
      const [itunesAlbums, deezerAlbums] = await Promise.allSettled([
        searchItunes(q, "album", Math.ceil(limit / 2)),
        searchDeezer(q, "album", Math.floor(limit / 2)),
      ]);
      const albums = [
        ...(itunesAlbums.status === "fulfilled" ? itunesAlbums.value.filter(r => r.wrapperType === "collection").map(mapItunesAlbum) : []),
        ...(deezerAlbums.status === "fulfilled" ? (deezerAlbums.value as DeezerAlbum[]).map(mapDeezerAlbum) : []),
      ].slice(0, limit);
      res.json({ tracks: [], artists: [], albums });
      return;
    }

    // type === "all" — parallel requests for each type
    const perType = Math.ceil(limit / 2);
    const [itunesSongs, itunesArtists, itunesAlbums, deezerTracks, deezerArtists, deezerAlbums] =
      await Promise.allSettled([
        searchItunes(q, "song", perType),
        searchItunes(q, "musicArtist", 6),
        searchItunes(q, "album", 6),
        searchDeezer(q, "track", perType),
        searchDeezer(q, "artist", 6),
        searchDeezer(q, "album", 6),
      ]);

    const tracks = [
      ...(itunesSongs.status === "fulfilled" ? itunesSongs.value.filter(r => r.wrapperType === "track").map(mapItunesTrack) : []),
      ...(deezerTracks.status === "fulfilled" ? (deezerTracks.value as DeezerTrack[]).map(mapDeezerTrack) : []),
    ].slice(0, limit);

    const artists = [
      ...(itunesArtists.status === "fulfilled" ? itunesArtists.value.filter(r => r.wrapperType === "artist").map(mapItunesArtist) : []),
      ...(deezerArtists.status === "fulfilled" ? (deezerArtists.value as DeezerArtist[]).map(mapDeezerArtist) : []),
    ].slice(0, 12);

    const albums = [
      ...(itunesAlbums.status === "fulfilled" ? itunesAlbums.value.filter(r => r.wrapperType === "collection").map(mapItunesAlbum) : []),
      ...(deezerAlbums.status === "fulfilled" ? (deezerAlbums.value as DeezerAlbum[]).map(mapDeezerAlbum) : []),
    ].slice(0, 12);

    res.json({ tracks, artists, albums });
  } catch (err) {
    req.log.error({ err }, "Search failed");
    res.json({ tracks: [], artists: [], albums: [] });
  }
});

router.get("/tracks/trending", async (req, res): Promise<void> => {
  const genre = String(req.query.genre ?? "").trim() || "pop";
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const perSource = Math.ceil(limit / 2);

  try {
    const [itunesResult, deezerResult] = await Promise.allSettled([
      searchItunes(genre, "song", perSource),
      searchDeezer(genre, "track", perSource),
    ]);

    const tracks = [
      ...(itunesResult.status === "fulfilled" ? itunesResult.value.filter(r => r.wrapperType === "track").map(mapItunesTrack) : []),
      ...(deezerResult.status === "fulfilled" ? (deezerResult.value as DeezerTrack[]).map(mapDeezerTrack) : []),
    ].slice(0, limit);

    res.json(tracks);
  } catch (err) {
    req.log.error({ err }, "Trending failed");
    res.json([]);
  }
});

router.get("/tracks/popular-artists", async (req, res): Promise<void> => {
  const genres = ["pop", "hip-hop", "r&b", "rock", "electronic", "latin"];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];

  try {
    const [itunesArtists, deezerArtists] = await Promise.allSettled([
      searchItunes(randomGenre, "musicArtist", 6),
      searchDeezer(randomGenre, "artist", 6),
    ]);

    const artists = [
      ...(itunesArtists.status === "fulfilled" ? itunesArtists.value.filter(r => r.wrapperType === "artist").map(mapItunesArtist) : []),
      ...(deezerArtists.status === "fulfilled" ? (deezerArtists.value as DeezerArtist[]).map(mapDeezerArtist) : []),
    ].slice(0, 10);

    res.json(artists);
  } catch (err) {
    req.log.error({ err }, "Popular artists failed");
    res.json([]);
  }
});

router.get("/tracks/popular-albums", async (req, res): Promise<void> => {
  const term = "top albums 2024";

  try {
    const [itunesAlbums, deezerAlbums] = await Promise.allSettled([
      searchItunes(term, "album", 8),
      searchDeezer(term, "album", 8),
    ]);

    const albums = [
      ...(itunesAlbums.status === "fulfilled" ? itunesAlbums.value.filter(r => r.wrapperType === "collection").map(mapItunesAlbum) : []),
      ...(deezerAlbums.status === "fulfilled" ? (deezerAlbums.value as DeezerAlbum[]).map(mapDeezerAlbum) : []),
    ].slice(0, 12);

    res.json(albums);
  } catch (err) {
    req.log.error({ err }, "Popular albums failed");
    res.json([]);
  }
});

router.get("/tracks/featured", async (req, res): Promise<void> => {
  const queries = ["Taylor Swift", "The Weeknd", "Drake", "Beyonce", "Bad Bunny"];
  const picked = queries[Math.floor(Date.now() / 3600000) % queries.length];

  try {
    const [itunesResult, deezerResult] = await Promise.allSettled([
      searchItunes(picked, "song", 4),
      searchDeezer(picked, "track", 4),
    ]);

    const tracks = [
      ...(itunesResult.status === "fulfilled" ? itunesResult.value.filter(r => r.wrapperType === "track").map(mapItunesTrack) : []),
      ...(deezerResult.status === "fulfilled" ? (deezerResult.value as DeezerTrack[]).map(mapDeezerTrack) : []),
    ].slice(0, 5);

    res.json(tracks);
  } catch (err) {
    req.log.error({ err }, "Featured failed");
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

  // Deezer track
  if (id.startsWith("deezer-") && !id.includes("artist") && !id.includes("album")) {
    const deezerIdStr = id.replace("deezer-", "");
    try {
      const resp = await fetch(`${DEEZER_BASE}/track/${deezerIdStr}`);
      const r = (await resp.json()) as DeezerTrack;
      if (r?.id) { res.json(mapDeezerTrack(r)); return; }
    } catch (_) { /* fall through */ }
  }

  // iTunes track
  const numericId = id.replace("itunes-", "");
  try {
    const resp = await fetch(`${ITUNES_BASE}/lookup?id=${encodeURIComponent(numericId)}&media=music`);
    const data = (await resp.json()) as { results: ITunesResult[] };
    const result = data.results?.[0];
    if (!result) { res.status(404).json({ error: "Track not found" }); return; }
    res.json(mapItunesTrack(result));
  } catch (err) {
    req.log.error({ err }, "Track lookup failed");
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

export default router;
