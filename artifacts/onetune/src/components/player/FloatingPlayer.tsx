import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Minimize2, Heart } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { useSaveToLibrary, useRemoveFromLibrary, useGetLibrary } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function FloatingPlayer() {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, nextTrack, prevTrack, volume, setVolume } = usePlayerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const saveMutation = useSaveToLibrary();
  const removeMutation = useRemoveFromLibrary();
  const { data: library } = useGetLibrary();
  
  const isSaved = library?.some(t => t.trackId === currentTrack?.id);

  useEffect(() => {
    if (audioRef.current && currentTrack?.previewUrl) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) pauseTrack();
    else resumeTrack();
  };
  
  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    if (isSaved) {
      removeMutation.mutate({ trackId: currentTrack.id });
    } else {
      saveMutation.mutate({ data: { 
        trackId: currentTrack.id, 
        title: currentTrack.title, 
        artist: currentTrack.artist, 
        artworkUrl: currentTrack.artworkUrl,
        previewUrl: currentTrack.previewUrl || undefined,
        durationMs: currentTrack.durationMs || undefined
      }});
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        src={currentTrack.previewUrl || undefined} 
        onEnded={nextTrack}
      />
      
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            layoutId="player-container"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-6 left-6 right-6 md:left-72 z-50 glass-card p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <motion.img 
              layoutId="player-artwork"
              src={currentTrack.artworkUrl} 
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <motion.h4 layoutId="player-title" className="text-white font-medium truncate text-sm">
                {currentTrack.title}
              </motion.h4>
              <motion.p layoutId="player-artist" className="text-white/60 text-xs truncate">
                {currentTrack.artist}
              </motion.p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button 
                data-testid="button-play-pause"
                onClick={togglePlay}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105",
                  isPlaying && "neon-box-pink"
                )}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
              <button onClick={toggleSave} className={cn("transition-colors", isSaved ? "text-primary" : "text-white/50 hover:text-white")}>
                <Heart className={cn("w-4 h-4", isSaved && "fill-current neon-glow-pink")} />
              </button>
              <button className="text-white/50 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layoutId="player-container"
            className="fixed inset-0 z-[100] glass-panel bg-black/60 flex flex-col items-center justify-center p-6 md:p-12"
          >
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-8 right-8 w-10 h-10 glass-button rounded-full flex items-center justify-center text-white z-50"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            
            <div className="max-w-md w-full flex flex-col items-center">
              <motion.img 
                layoutId="player-artwork"
                src={currentTrack.artworkUrl} 
                alt={currentTrack.title}
                className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl mb-8"
                style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)' }}
              />
              
              <div className="w-full flex items-center justify-between mb-8">
                <div className="min-w-0 flex-1 text-center">
                  <motion.h2 layoutId="player-title" className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">
                    {currentTrack.title}
                  </motion.h2>
                  <motion.p layoutId="player-artist" className="text-lg text-white/60 truncate">
                    {currentTrack.artist}
                  </motion.p>
                </div>
              </div>
              
              {/* Progress bar mock */}
              <div className="w-full mb-8 relative">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: "0%" }}
                    animate={{ width: isPlaying ? "100%" : "30%" }}
                    transition={{ duration: 30, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-2 font-mono">
                  <span>0:00</span>
                  <span>{currentTrack.durationMs ? `${Math.floor(currentTrack.durationMs / 60000)}:${String(Math.floor((currentTrack.durationMs % 60000) / 1000)).padStart(2, '0')}` : '0:30'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-8 w-full">
                <button onClick={toggleSave} className={cn("transition-colors", isSaved ? "text-primary" : "text-white/50 hover:text-white")}>
                  <Heart className={cn("w-6 h-6", isSaved && "fill-current neon-glow-pink")} />
                </button>

                <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
                  <SkipBack className="w-8 h-8 fill-current" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className={cn(
                    "w-20 h-20 flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 shadow-xl",
                    isPlaying && "neon-box-pink"
                  )}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                
                <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
                  <SkipForward className="w-8 h-8 fill-current" />
                </button>

                <div className="flex items-center gap-2 group relative">
                  <Volume2 className="w-6 h-6 text-white/50 hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
