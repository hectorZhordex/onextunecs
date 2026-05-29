import { useRef } from "react";
import { motion } from "framer-motion";
import {
  useGetFeaturedTracks,
  useGetTrendingTracks,
  useGetPopularArtists,
  useGetPopularAlbums,
  useGetHistory,
} from "@workspace/api-client-react";
import { TrackCard } from "@/components/ui/TrackCard";
import { Play, ChevronRight, User, Disc } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { Link } from "wouter";

function HScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      {to && (
        <Link href={to}>
          <span className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            Show all <ChevronRight className="w-4 h-4" />
          </span>
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { data: featuredTracks, isLoading: featuredLoading } = useGetFeaturedTracks();
  const { data: trendingTracks, isLoading: trendingLoading } = useGetTrendingTracks({ limit: 12 });
  const { data: popularArtists } = useGetPopularArtists();
  const { data: popularAlbums } = useGetPopularAlbums();
  const { data: history } = useGetHistory({ limit: 6 });
  const { playTrack } = usePlayerStore();

  const heroTrack = featuredTracks?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-10 pt-6"
    >
      {/* Hero Section */}
      {featuredLoading ? (
        <div className="w-full h-[340px] rounded-[2rem] glass-card animate-pulse" />
      ) : heroTrack ? (
        <section className="relative w-full h-[340px] rounded-[2rem] overflow-hidden glass-card group">
          <div className="absolute inset-0">
            <img
              src={heroTrack.artworkUrl}
              alt={heroTrack.title}
              className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#222] via-[#222]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#222] via-[#222]/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-8 flex flex-col items-start max-w-xl">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full border border-primary/20 mb-3">
              Featured Release
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-tight tracking-tight drop-shadow-xl">
              {heroTrack.title}
            </h1>
            <p className="text-base text-white/70 mb-6 font-light">{heroTrack.artist}</p>
            <button
              data-testid="button-hero-play"
              onClick={() => playTrack(heroTrack, featuredTracks)}
              className="px-7 py-3 bg-primary text-white rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all neon-box-pink hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Listen Now
            </button>
          </div>
        </section>
      ) : null}

      {/* Trending Songs */}
      <section>
        <SectionHeader title="Trending Songs" to="/search" />
        {trendingLoading ? (
          <HScrollRow>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-none w-40 glass-card rounded-2xl animate-pulse aspect-square" />
            ))}
          </HScrollRow>
        ) : (
          <HScrollRow>
            {trendingTracks?.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex-none w-40"
              >
                <TrackCard track={track} tracks={trendingTracks} className="!shadow-none" />
              </motion.div>
            ))}
          </HScrollRow>
        )}
      </section>

      {/* Popular Artists */}
      {(popularArtists?.length ?? 0) > 0 && (
        <section>
          <SectionHeader title="Popular Artists" />
          <HScrollRow>
            {popularArtists?.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex-none w-32 flex flex-col items-center gap-2 cursor-pointer group"
                data-testid={`card-artist-${artist.id}`}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/50 transition-all shadow-lg">
                  {artist.artworkUrl ? (
                    <img
                      src={artist.artworkUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                <p className="text-white text-sm font-semibold text-center leading-tight truncate w-full px-1">
                  {artist.name}
                </p>
                <p className="text-white/40 text-xs">Artist</p>
              </motion.div>
            ))}
          </HScrollRow>
        </section>
      )}

      {/* Popular Albums & Singles */}
      {(popularAlbums?.length ?? 0) > 0 && (
        <section>
          <SectionHeader title="Popular Albums &amp; Singles" />
          <HScrollRow>
            {popularAlbums?.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex-none w-40 flex flex-col gap-2 cursor-pointer group"
                data-testid={`card-album-${album.id}`}
              >
                <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-lg">
                  {album.artworkUrl ? (
                    <img
                      src={album.artworkUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full glass-card flex items-center justify-center">
                      <Disc className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold truncate">{album.title}</p>
                  <p className="text-white/40 text-xs truncate">{album.artist}</p>
                </div>
              </motion.div>
            ))}
          </HScrollRow>
        </section>
      )}

      {/* Recently Played */}
      {history && history.length > 0 && (
        <section>
          <SectionHeader title="Recently Played" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-panel p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() =>
                  playTrack({
                    id: entry.trackId,
                    title: entry.title,
                    artist: entry.artist,
                    artworkUrl: entry.artworkUrl,
                    previewUrl: entry.previewUrl,
                    durationMs: entry.durationMs,
                  })
                }
                data-testid={`row-history-${entry.id}`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-none">
                  <img src={entry.artworkUrl} alt={entry.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{entry.title}</h4>
                  <p className="text-white/50 text-xs truncate">{entry.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
