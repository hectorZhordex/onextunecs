import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useGetPlaylist, getGetPlaylistQueryKey, useUpdatePlaylist, useDeletePlaylist, useRemoveTrackFromPlaylist } from "@workspace/api-client-react";
import { Play, ListMusic, Clock, Heart, MoreHorizontal, Trash2, Edit2, X } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const playlistId = Number(id);
  
  const { data: playlist, isLoading } = useGetPlaylist(playlistId, {
    query: {
      enabled: !!id,
      queryKey: getGetPlaylistQueryKey(playlistId)
    }
  });

  const updateMutation = useUpdatePlaylist();
  const deleteMutation = useDeletePlaylist();
  const removeTrackMutation = useRemoveTrackFromPlaylist();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { playTrack } = usePlayerStore();

  if (isLoading) return <div className="pt-20 text-white/50 text-center">Loading playlist...</div>;
  if (!playlist) return <div className="pt-20 text-white/50 text-center">Playlist not found</div>;

  const tracks = playlist.tracks.map(pt => ({
    id: pt.trackId,
    title: pt.title,
    artist: pt.artist,
    album: pt.album,
    artworkUrl: pt.artworkUrl,
    previewUrl: pt.previewUrl,
    durationMs: pt.durationMs
  }));

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleEditOpen = () => {
    setName(playlist.name);
    setDesc(playlist.description || "");
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!name.trim()) return;
    await updateMutation.mutateAsync({
      id: playlistId,
      data: { name, description: desc }
    });
    queryClient.invalidateQueries({ queryKey: getGetPlaylistQueryKey(playlistId) });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      await deleteMutation.mutateAsync({ id: playlistId });
      setLocation("/playlists");
    }
  };

  const handleRemoveTrack = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeTrackMutation.mutateAsync({ id: playlistId, trackId });
    queryClient.invalidateQueries({ queryKey: getGetPlaylistQueryKey(playlistId) });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8 pt-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end">
        <div className="w-52 h-52 md:w-64 md:h-64 rounded-3xl shadow-2xl overflow-hidden glass-card flex-shrink-0 flex items-center justify-center relative group">
          {playlist.artworkUrl ? (
            <img src={playlist.artworkUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <ListMusic className="w-20 h-20 text-white/20" />
          )}
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          <span className="text-sm font-medium tracking-wider text-white/60 uppercase">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight break-all">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-white/70 text-lg">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
            <span>{playlist.tracks.length} tracks</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 py-4">
        <button 
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center neon-box-pink hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play className="w-6 h-6 fill-current ml-1" />
        </button>
        
        <button onClick={handleEditOpen} className="w-10 h-10 glass-button rounded-full flex items-center justify-center text-white/70 hover:text-white">
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button onClick={handleDelete} className="w-10 h-10 glass-button rounded-full flex items-center justify-center text-white/70 hover:text-red-500 hover:border-red-500/30">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tracks List */}
      <div className="flex flex-col">
        <div className="grid grid-cols-[16px_1fr_minmax(120px,200px)_80px] gap-4 px-4 py-2 border-b border-white/10 text-white/50 text-sm font-medium">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="flex justify-end"><Clock className="w-4 h-4 mr-6" /></div>
        </div>
        
        <div className="flex flex-col pt-2">
          {playlist.tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => playTrack(tracks[i], tracks)}
              className="grid grid-cols-[16px_1fr_minmax(120px,200px)_80px] gap-4 px-4 py-3 items-center rounded-xl hover:bg-white/5 group cursor-pointer transition-colors"
            >
              <div className="text-white/40 text-sm text-center group-hover:hidden">{i + 1}</div>
              <div className="hidden group-hover:flex items-center justify-center text-primary">
                <Play className="w-4 h-4 fill-current" />
              </div>
              
              <div className="flex items-center gap-3 min-w-0">
                <img src={track.artworkUrl} alt={track.title} className="w-10 h-10 rounded-md object-cover" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-medium truncate">{track.title}</span>
                  <span className="text-white/50 text-xs truncate">{track.artist}</span>
                </div>
              </div>
              
              <div className="hidden md:block text-white/50 text-sm truncate">
                {track.album || '-'}
              </div>
              
              <div className="flex items-center justify-end gap-4 text-white/50 text-sm">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <button onClick={(e) => handleRemoveTrack(track.trackId, e)} className="p-1 hover:text-red-500 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <span>
                  {track.durationMs ? `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}` : '-:--'}
                </span>
              </div>
            </motion.div>
          ))}
          {playlist.tracks.length === 0 && (
            <div className="py-12 text-center text-white/50">
              No tracks in this playlist yet.
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="glass-panel border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="bg-black/20 border-white/10 text-white focus-visible:ring-primary"
                placeholder="My awesome mix"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Description</label>
              <Input 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                className="bg-black/20 border-white/10 text-white focus-visible:ring-primary"
                placeholder="Optional description"
              />
            </div>
            <Button 
              onClick={handleEditSave} 
              disabled={!name.trim() || updateMutation.isPending}
              className="mt-4 bg-primary text-white hover:bg-primary/90 rounded-full"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
