import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchMusic } from "@workspace/api-client-react";
import { TrackCard } from "@/components/ui/TrackCard";
import { Search as SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data: results, isLoading } = useSearchMusic(
    { q: debouncedQuery, type: "all", limit: 20 },
    { query: { enabled: debouncedQuery.length > 1 } }
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 pt-8"
    >
      <div className="relative max-w-2xl mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-white/50" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks, artists, albums..."
          className="w-full glass-panel pl-16 pr-6 py-5 rounded-full text-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {isLoading && (
        <div className="text-center text-white/50 mt-10">Searching the cosmos...</div>
      )}

      {results?.tracks && results.tracks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Top Tracks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <TrackCard track={track} tracks={results.tracks} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {results?.artists && results.artists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex flex-col items-center text-center gap-4 group cursor-pointer hover:bg-white/10"
              >
                <img 
                  src={artist.artworkUrl || "https://via.placeholder.com/150"} 
                  alt={artist.name} 
                  className="w-24 h-24 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <h4 className="text-white font-medium">{artist.name}</h4>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && debouncedQuery.length > 1 && !results?.tracks.length && !results?.artists.length && (
        <div className="text-center text-white/50 mt-20 text-lg">
          No signals found in the sector for "{debouncedQuery}".
        </div>
      )}
    </motion.div>
  );
}
