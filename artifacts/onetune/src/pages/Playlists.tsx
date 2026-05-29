import { motion } from "framer-motion";
import { useGetPlaylists, useCreatePlaylist } from "@workspace/api-client-react";
import { Plus, ListMusic, Play } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Playlists() {
  const { data: playlists, refetch } = useGetPlaylists();
  const createMutation = useCreatePlaylist();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createMutation.mutateAsync({
      data: { name, description: desc }
    });
    setIsOpen(false);
    setName("");
    setDesc("");
    refetch();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-12 pt-8"
    >
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-bold text-white tracking-tight">Your Playlists</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="px-5 py-2.5 glass-button rounded-full text-white font-medium flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Playlist
            </button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Playlist</DialogTitle>
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
                onClick={handleCreate} 
                disabled={!name.trim() || createMutation.isPending}
                className="mt-4 bg-primary text-white hover:bg-primary/90 rounded-full"
              >
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists?.map((playlist, i) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/playlist/${playlist.id}`} className="block">
              <div className="glass-card group p-4 flex flex-col gap-4 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="aspect-square rounded-2xl bg-white/5 flex items-center justify-center relative overflow-hidden">
                  {playlist.artworkUrl ? (
                    <img src={playlist.artworkUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <ListMusic className="w-12 h-12 text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white neon-box-pink transform scale-75 group-hover:scale-100 transition-all">
                      <Play className="w-5 h-5 fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium truncate">{playlist.name}</h3>
                  <p className="text-white/50 text-sm">{playlist.trackCount || 0} tracks</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
