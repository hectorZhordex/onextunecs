import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Minimize2, Heart } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import {
  useSaveToLibrary, useRemoveFromLibrary, useGetLibrary,
  useGetYoutubeVideoId,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import YouTube, { YouTubePlayer } from "react-youtube";

export function FloatingPlayer() {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack, nextTrack, prevTrack, volume, setVolume } =
    usePlayerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // YouTube player instance
  const ytRef = useRef<YouTubePlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback audio for tracks without a YouTube ID
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const saveMutation = useSaveToLibrary();
  const removeMutation = useRemoveFromLibrary();
  const { data: library } = useGetLibrary();
  const isSaved = library?.some((t) => t.trackId === currentTrack?.id);

  // Fetch YouTube video ID for current track
  const { data: ytData } = useGetYoutubeVideoId(
    { title: currentTrack?.title ?? "", artist: currentTrack?.artist ?? "" },
    { query: { enabled: !!currentTrack, staleTime: 1000 * 60 * 10 } }
  );
  const videoId = ytData?.videoId ?? null;

  // Poll YouTube current time
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      if (ytRef.current) {
        try {
          const t = await ytRef.current.getCurrentTime();
          const d = await ytRef.current.getDuration();
          setCurrentTime(t);
          if (d > 0) setDuration(d);
        } catch (_) {}
      }
    }, 500);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // When track changes — reset state, auto-play when videoId arrives
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    stopTimer();
    // Also reset fallback audio
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
  }, [currentTrack?.id]);

  // When videoId resolves — play or pause accordingly
  useEffect(() => {
    if (!ytRef.current) return;
    if (videoId) {
      ytRef.current.loadVideoById(videoId);
      if (isPlaying) { ytRef.current.playVideo(); startTimer(); }
      else ytRef.current.pauseVideo();
    }
  }, [videoId]);

  // Play/pause changes
  useEffect(() => {
    if (videoId && ytRef.current) {
      if (isPlaying) { ytRef.current.playVideo(); startTimer(); }
      else { ytRef.current.pauseVideo(); stopTimer(); }
    } else if (!videoId && currentTrack?.previewUrl && audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // Fallback audio: load when track changes and no videoId
  useEffect(() => {
    if (!videoId && currentTrack?.previewUrl && audioRef.current) {
      audioRef.current.src = currentTrack.previewUrl;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(console.error);
    }
  }, [currentTrack?.id, videoId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytRef.current) ytRef.current.setVolume(volume * 100);
  }, [volume]);

  useEffect(() => () => stopTimer(), []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    isPlaying ? pauseTrack() : resumeTrack();
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    if (isSaved) {
      removeMutation.mutate({ trackId: currentTrack.id });
    } else {
      saveMutation.mutate({
        data: {
          trackId: currentTrack.id,
          title: currentTrack.title,
          artist: currentTrack.artist,
          artworkUrl: currentTrack.artworkUrl,
          previewUrl: currentTrack.previewUrl || undefined,
          durationMs: currentTrack.durationMs || undefined,
        },
      });
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * duration;
    if (videoId && ytRef.current) ytRef.current.seekTo(t, true);
    else if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const ytOpts = {
    height: "1",
    width: "1",
    playerVars: { autoplay: 1 as const, controls: 0 as const, rel: 0 as const },
  };

  if (!currentTrack) return null;

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden YouTube player — always mounted when videoId exists */}
      {videoId && (
        <div className="fixed -bottom-1 -left-1 opacity-0 pointer-events-none z-0 overflow-hidden" style={{ width: 1, height: 1 }}>
          <YouTube
            videoId={videoId}
            opts={ytOpts}
            onReady={(e: YouTubeEvent) => {
              ytRef.current = e.target;
              e.target.setVolume(volume * 100);
              if (isPlaying) { e.target.playVideo(); startTimer(); }
            }}
            onEnd={() => { stopTimer(); nextTrack(); }}
            onStateChange={(e: YouTubeEvent) => {
              // YT.PlayerState.PLAYING = 1
              if (e.data === 1) startTimer();
              else stopTimer();
            }}
          />
        </div>
      )}

      {/* Fallback audio element */}
      {!videoId && (
        <audio
          ref={audioRef}
          onEnded={nextTrack}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        />
      )}

      {/* Collapsed pill */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            layoutId="player-container"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-6 left-6 right-6 md:left-72 z-50 cursor-pointer rounded-3xl overflow-hidden"
            style={{
              background: "rgba(18, 18, 18, 0.92)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Progress bar at top of pill */}
            <div className="h-0.5 w-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${progressPct}%`, transition: "width 0.5s linear" }}
              />
            </div>

            <div className="p-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <motion.img
                layoutId="player-artwork"
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover flex-none"
              />
              <div className="flex-1 min-w-0">
                <motion.h4 layoutId="player-title" className="text-white font-medium truncate text-sm">
                  {currentTrack.title}
                </motion.h4>
                <motion.p layoutId="player-artist" className="text-white/50 text-xs truncate">
                  {currentTrack.artist}
                  {videoId && <span className="ml-1 text-primary/60 text-[10px]">● Full</span>}
                </motion.p>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  data-testid="button-play-pause"
                  onClick={togglePlay}
                  className={cn("w-10 h-10 flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105", isPlaying && "neon-box-pink")}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                <button onClick={toggleSave} className={cn("transition-colors", isSaved ? "text-primary" : "text-white/40 hover:text-white")}>
                  <Heart className={cn("w-4 h-4", isSaved && "fill-current neon-glow-pink")} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="text-white/40 hover:text-white transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded fullscreen */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layoutId="player-container"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 md:p-12"
            style={{ background: "rgba(14,14,14,0.96)", backdropFilter: "blur(40px)" }}
          >
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-8 right-8 w-10 h-10 glass-button rounded-full flex items-center justify-center text-white z-50"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            <div className="max-w-md w-full flex flex-col items-center">
              {/* Artwork */}
              <motion.img
                layoutId="player-artwork"
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-64 h-64 md:w-72 md:h-72 rounded-3xl object-cover mb-6"
                style={{ boxShadow: "0 24px 60px -10px rgba(0,0,0,0.6)" }}
              />

              {/* Title */}
              <div className="w-full text-center mb-6">
                <motion.h2 layoutId="player-title" className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                  {currentTrack.title}
                </motion.h2>
                <motion.p layoutId="player-artist" className="text-white/50 truncate">
                  {currentTrack.artist}
                </motion.p>
                {videoId
                  ? <p className="text-xs text-primary/70 mt-1">Playing full song via YouTube</p>
                  : <p className="text-xs text-white/30 mt-1">30-second preview</p>
                }
              </div>

              {/* Progress bar */}
              <div className="w-full mb-6">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={seek}>
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${progressPct}%`, transition: "width 0.5s linear" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-2 font-mono">
                  <span>{fmt(currentTime)}</span>
                  <span>{duration ? fmt(duration) : "--:--"}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-8 w-full mb-6">
                <button onClick={toggleSave} className={cn("transition-colors", isSaved ? "text-primary" : "text-white/40 hover:text-white")}>
                  <Heart className={cn("w-6 h-6", isSaved && "fill-current neon-glow-pink")} />
                </button>
                <button onClick={prevTrack} className="text-white/60 hover:text-white transition-colors">
                  <SkipBack className="w-8 h-8" />
                </button>
                <button
                  onClick={togglePlay}
                  className={cn("w-20 h-20 flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 shadow-xl", isPlaying && "neon-box-pink")}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button onClick={nextTrack} className="text-white/60 hover:text-white transition-colors">
                  <SkipForward className="w-8 h-8" />
                </button>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-white/40" />
                  <input
                    type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
