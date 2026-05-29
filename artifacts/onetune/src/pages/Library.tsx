import { motion } from "framer-motion";
import { useGetLibrary, useGetStats } from "@workspace/api-client-react";
import { TrackCard } from "@/components/ui/TrackCard";

export default function Library() {
  const { data: library, isLoading: isLoadingLib } = useGetLibrary();
  const { data: stats, isLoading: isLoadingStats } = useGetStats();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-12 pt-8"
    >
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-bold text-white tracking-tight">Your Library</h1>
      </div>

      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col justify-center">
            <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Total Plays</h3>
            <p className="text-5xl font-bold text-white neon-glow-pink">{stats.totalPlays}</p>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Top Artists</h3>
            <div className="flex flex-col gap-3">
              {stats.topArtists.slice(0,3).map((artist, i) => (
                <div key={artist.artist} className="flex items-center gap-3">
                  <span className="text-primary font-bold w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{artist.artist}</p>
                  </div>
                  <span className="text-white/50 text-sm">{artist.count} plays</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Top Genres</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topGenres.map(genre => (
                <span key={genre.genre} className="px-3 py-1 glass-panel rounded-full text-sm text-white border border-white/10">
                  {genre.genre} <span className="text-white/40 ml-1">{genre.count}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Saved Tracks</h2>
        {isLoadingLib ? (
          <div className="text-white/50">Loading library...</div>
        ) : library && library.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {library.map((item, i) => {
              const track = {
                id: item.trackId,
                title: item.title,
                artist: item.artist,
                artworkUrl: item.artworkUrl,
                previewUrl: item.previewUrl,
                durationMs: item.durationMs,
                album: item.album,
                genre: item.genre
              };
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TrackCard 
                    track={track} 
                    tracks={library.map(l => ({
                      id: l.trackId, title: l.title, artist: l.artist, artworkUrl: l.artworkUrl, previewUrl: l.previewUrl, durationMs: l.durationMs
                    }))} 
                  />
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-xl text-white/70">Your library is empty.</p>
            <p className="text-white/50 text-sm">Save some tracks to see them here.</p>
          </div>
        )}
      </section>

    </motion.div>
  );
}
