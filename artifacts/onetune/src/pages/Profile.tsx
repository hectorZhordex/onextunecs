import { useState } from "react";
import { motion } from "framer-motion";
import { useGetLibrary, useGetHistory, useGetStats, useGetPlaylists } from "@workspace/api-client-react";
import { LogOut, Music, Clock, Heart, ListMusic, User, Edit2, Check } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";

interface ProfileProps {
  username: string;
  onLogout: () => void;
}

export default function Profile({ username, onLogout }: ProfileProps) {
  const [displayName, setDisplayName] = useState(username);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(username);

  const { data: library } = useGetLibrary();
  const { data: history } = useGetHistory({ limit: 50 });
  const { data: stats } = useGetStats();
  const { data: playlists } = useGetPlaylists();

  function saveEdit() {
    if (editValue.trim()) {
      setDisplayName(editValue.trim());
      localStorage.setItem("onetune_user", editValue.trim());
    }
    setEditing(false);
  }

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statCards = [
    { icon: Music, label: "Tracks Played", value: stats?.totalPlays ?? 0, color: "text-primary" },
    { icon: Heart, label: "Saved Tracks", value: library?.length ?? 0, color: "text-rose-400" },
    { icon: ListMusic, label: "Playlists", value: playlists?.length ?? 0, color: "text-violet-400" },
    { icon: Clock, label: "Recent Plays", value: history?.length ?? 0, color: "text-amber-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 pt-6 max-w-3xl"
    >
      {/* Header */}
      <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full glass-panel border-2 border-primary/40 flex items-center justify-center text-3xl font-bold text-white">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                data-testid="input-display-name"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="glass-card px-3 py-1.5 rounded-lg text-white text-xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
              />
              <button
                data-testid="button-save-name"
                onClick={saveEdit}
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors"
              >
                <Check className="w-4 h-4 text-primary" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <button
                data-testid="button-edit-name"
                onClick={() => { setEditing(true); setEditValue(displayName); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
              </button>
            </div>
          )}
          <p className="text-white/40 text-sm mt-1">OneTune Member</p>
        </div>

        <div className="flex items-center gap-2">
          <img src={logoImg} alt="OneTune" className="w-8 h-8 object-contain opacity-60" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 rounded-2xl flex flex-col gap-2"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Top Artists */}
      {stats?.topArtists && stats.topArtists.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Top Artists</h2>
          <div className="flex flex-col gap-2">
            {stats.topArtists.slice(0, 5).map((artist, i) => (
              <motion.div
                key={artist.artist}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-panel p-3 rounded-xl flex items-center gap-4"
              >
                <span className="text-white/30 text-sm font-mono w-5 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                  {artist.artworkUrl ? (
                    <img src={artist.artworkUrl} alt={artist.artist} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{artist.artist}</p>
                  <p className="text-white/40 text-xs">{artist.count} plays</p>
                </div>
                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${Math.min(100, (artist.count / (stats.topArtists[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Logout */}
      <div className="pb-4">
        <button
          data-testid="button-logout"
          onClick={onLogout}
          className="glass-button px-6 py-3 rounded-2xl flex items-center gap-3 text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:text-rose-400 transition-colors" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
}
