import { motion } from "framer-motion";
import { useGetFeaturedTracks, useGetTrendingTracks, useGetGenres, useGetHistory } from "@workspace/api-client-react";
import { TrackCard } from "@/components/ui/TrackCard";
import { Play } from "lucide-react";
import { usePlayerStore } from "@/store/player";

export default function Home() {
  const { data: featuredTracks } = useGetFeaturedTracks();
  const { data: trendingTracks } = useGetTrendingTracks({ limit: 10 });
  const { data: genres } = useGetGenres();
  const { data: history } = useGetHistory({ limit: 5 });
  const { playTrack } = usePlayerStore();

  const heroTrack = featuredTracks?.[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-12 pt-8"
    >
      {/* Hero Section */}
      {heroTrack && (
        <section className="relative w-full h-[400px] rounded-[2rem] overflow-hidden glass-card group">
          <div className="absolute inset-0">
            <img 
              src={heroTrack.artworkUrl} 
              alt={heroTrack.title}
              className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-10 flex flex-col items-start max-w-2xl">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md mb-4 neon-glow-pink">
              Featured Release
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 leading-tight tracking-tight drop-shadow-xl">
              {heroTrack.title}
            </h1>
            <p className="text-xl text-white/80 mb-8 font-light">
              {heroTrack.artist}
            </p>
            <button 
              onClick={() => playTrack(heroTrack, featuredTracks)}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold flex items-center gap-3 hover:bg-primary/90 transition-all neon-box-pink hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Listen Now
            </button>
          </div>
        </section>
      )}

      {/* Trending Tracks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trendingTracks?.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TrackCard track={track} tracks={trendingTracks} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Genres Grid */}
      <section>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Explore Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres?.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card aspect-video p-4 flex items-end cursor-pointer overflow-hidden relative group"
              style={{ background: genre.color ? `linear-gradient(to bottom right, ${genre.color}40, transparent)` : undefined }}
            >
              <h3 className="text-white font-bold text-lg relative z-10 group-hover:-translate-y-2 transition-transform">{genre.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Recent Activity */}
      {history && history.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Recently Played</h2>
          <div className="flex flex-col gap-2">
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-3 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => playTrack({
                  id: entry.trackId,
                  title: entry.title,
                  artist: entry.artist,
                  artworkUrl: entry.artworkUrl,
                  previewUrl: entry.previewUrl,
                  durationMs: entry.durationMs
                })}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                  <img src={entry.artworkUrl} alt={entry.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{entry.title}</h4>
                  <p className="text-white/60 text-sm truncate">{entry.artist}</p>
                </div>
                <div className="text-white/40 text-sm pr-4">
                  {new Date(entry.playedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
