import { Play, MoreVertical, Plus, Heart } from "lucide-react";
import {
  Track,
  useAddToHistory,
  useGetPlaylists,
  useAddTrackToPlaylist,
  useSaveToLibrary,
  useRemoveFromLibrary,
  useGetLibrary,
} from "@workspace/api-client-react";
import { usePlayerStore } from "@/store/player";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { getGetLibraryQueryKey } from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function TrackCard({ track, tracks, className }: { track: Track; tracks?: Track[]; className?: string }) {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const addToHistory = useAddToHistory();
  const { data: playlists } = useGetPlaylists();
  const addToPlaylist = useAddTrackToPlaylist();
  const queryClient = useQueryClient();

  const saveMutation = useSaveToLibrary({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLibraryQueryKey() }),
    },
  });
  const removeMutation = useRemoveFromLibrary({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLibraryQueryKey() }),
    },
  });
  const { data: library } = useGetLibrary();

  const isSaved = library?.some((t) => t.trackId === track.id);
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = () => {
    playTrack(track, tracks);
    addToHistory.mutate({
      data: {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        previewUrl: track.previewUrl || undefined,
        durationMs: track.durationMs || undefined,
      },
    });
  };

  const handleAddToPlaylist = (playlistId: number) => {
    addToPlaylist.mutate({
      id: playlistId,
      data: {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || undefined,
        artworkUrl: track.artworkUrl,
        previewUrl: track.previewUrl || undefined,
        durationMs: track.durationMs || undefined,
      },
    });
  };

  const toggleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isSaved) {
      removeMutation.mutate({ trackId: track.id });
    } else {
      saveMutation.mutate({
        data: {
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album || undefined,
          artworkUrl: track.artworkUrl,
          previewUrl: track.previewUrl || undefined,
          durationMs: track.durationMs || undefined,
          genre: track.genre || undefined,
        },
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card group relative p-3 flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-300 ${className ?? ""}`}
      data-testid={`card-track-${track.id}`}
    >
      {/* Artwork */}
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md" onClick={handlePlay}>
        <img
          src={track.artworkUrl}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white neon-box-pink transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
        {isCurrent && isPlaying && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="px-0.5 flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1" onClick={handlePlay}>
          <h4 className="text-white font-semibold text-sm truncate leading-snug">{track.title}</h4>
          <p className="text-white/45 text-xs truncate mt-0.5">{track.artist}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-none">
          {/* Visible heart button */}
          <button
            data-testid={`button-like-${track.id}`}
            onClick={toggleSave}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
              isSaved
                ? "text-primary"
                : "text-white/0 group-hover:text-white/40 hover:!text-primary"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${isSaved ? "fill-current scale-110" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 flex items-center justify-center rounded-full text-white/0 group-hover:text-white/40 hover:text-white transition-all">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel text-white border-white/10" align="end">
              <DropdownMenuItem
                onClick={() => toggleSave()}
                className="cursor-pointer focus:bg-white/10 focus:text-white"
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-primary text-primary" : ""}`} />
                {isSaved ? "Remove from Library" : "Save to Library"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer focus:bg-white/10 focus:text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="glass-panel text-white border-white/10">
                    {playlists?.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-white/50">No playlists yet</div>
                    ) : (
                      playlists?.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => handleAddToPlaylist(p.id)}
                          className="cursor-pointer focus:bg-white/10 focus:text-white"
                        >
                          {p.name}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
