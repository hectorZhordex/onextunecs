import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchMusic, getSearchMusicQueryKey } from "@workspace/api-client-react";
import { TrackCard } from "@/components/ui/TrackCard";
import { Search as SearchIcon, Music, User, Disc } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const { data: results, isLoading } = useSearchMusic(
    { q: debouncedQuery, type: "all", limit: 24 },
    {
      query: {
        enabled: debouncedQuery.length > 1,
        queryKey: getSearchMusicQueryKey({ q: debouncedQuery, type: "all", limit: 24 }),
      },
    }
  );

  const hasResults =
    (results?.tracks?.length ?? 0) > 0 ||
    (results?.artists?.length ?? 0) > 0 ||
    (results?.albums?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-10 pt-6"
    >
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          <SearchIcon className="h-5 w-5 text-white/40" />
        </div>
        <input
          data-testid="input-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks, artists, albums..."
          autoFocus
          className="w-full glass-panel pl-14 pr-6 py-4 rounded-full text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all duration-300"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
            <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Empty state — before search */}
      {!debouncedQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-6 mt-16 text-white/30"
        >
          <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center">
            <SearchIcon className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-lg">Start typing to search the universe</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Loading */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-white/40 mt-10 text-lg"
          >
            Searching OneTune...
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && debouncedQuery.length > 1 && !hasResults && (
          <motion.div
            key="noresults"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-white/40 mt-20 text-lg"
          >
            No signals found for &ldquo;{debouncedQuery}&rdquo;
          </motion.div>
        )}

        {/* Results */}
        {!isLoading && hasResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-10"
          >
            {/* Tracks */}
            {(results?.tracks?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Music className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">Tracks</h2>
                  <span className="text-white/30 text-sm ml-1">({results!.tracks.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results!.tracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      data-testid={`card-track-${track.id}`}
                    >
                      <TrackCard track={track} tracks={results!.tracks} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(results?.artists?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">Artists</h2>
                  <span className="text-white/30 text-sm ml-1">({results!.artists.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results!.artists.map((artist, i) => (
                    <motion.div
                      key={artist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card p-4 flex flex-col items-center text-center gap-3 group cursor-pointer hover:bg-white/10 transition-colors"
                      data-testid={`card-artist-${artist.id}`}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
                        {artist.artworkUrl ? (
                          <img
                            src={artist.artworkUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <User className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight">{artist.name}</p>
                        {artist.genre && (
                          <p className="text-white/40 text-xs mt-0.5">{artist.genre}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {(results?.albums?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Disc className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">Albums</h2>
                  <span className="text-white/30 text-sm ml-1">({results!.albums.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results!.albums.map((album, i) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card p-3 flex flex-col gap-2 group cursor-pointer hover:bg-white/10 transition-colors"
                      data-testid={`card-album-${album.id}`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden">
                        {album.artworkUrl ? (
                          <img
                            src={album.artworkUrl}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <Disc className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="px-1">
                        <p className="text-white font-semibold text-sm leading-tight truncate">{album.title}</p>
                        <p className="text-white/40 text-xs mt-0.5 truncate">{album.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
