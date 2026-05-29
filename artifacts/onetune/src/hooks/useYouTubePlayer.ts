import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          width?: number | string;
          height?: number | string;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayerInstance }) => void;
            onStateChange?: (e: { data: number }) => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(vol: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

let apiReady = false;
let apiLoading = false;
const pendingCallbacks: Array<() => void> = [];

function loadYTApi(onReady: () => void) {
  if (apiReady && window.YT?.Player) {
    onReady();
    return;
  }
  pendingCallbacks.push(onReady);
  if (apiLoading) return;
  apiLoading = true;

  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    apiLoading = false;
    pendingCallbacks.forEach((cb) => cb());
    pendingCallbacks.length = 0;
    prev?.();
  };

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

interface UseYouTubePlayerOptions {
  videoId: string | null;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  containerId: string;
}

export function useYouTubePlayer({
  videoId,
  isPlaying,
  volume,
  onEnded,
  containerId,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);

  isPlayingRef.current = isPlaying;
  volumeRef.current = volume;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const t = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration();
        setCurrentTime(t);
        if (d > 0) setDuration(d);
      } catch (_) {}
    }, 500);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  // Create / destroy player when videoId changes
  useEffect(() => {
    if (!videoId) {
      playerRef.current?.destroy();
      playerRef.current = null;
      stopTimer();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    setCurrentTime(0);
    setDuration(0);

    loadYTApi(() => {
      // Destroy previous player if any
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      playerRef.current = new window.YT.Player(container, {
        width: 1,
        height: 1,
        videoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            e.target.setVolume(volumeRef.current * 100);
            if (isPlayingRef.current) {
              e.target.playVideo();
              startTimer();
            } else {
              e.target.pauseVideo();
            }
          },
          onStateChange: (e) => {
            // PlayerState.ENDED = 0
            if (e.data === 0) {
              stopTimer();
              onEnded();
            }
            // PlayerState.PLAYING = 1
            if (e.data === 1) startTimer();
            // PlayerState.PAUSED = 2
            if (e.data === 2) stopTimer();
          },
        },
      });
    });

    return () => {
      stopTimer();
    };
  }, [videoId, containerId]);

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.playVideo();
      startTimer();
    } else {
      playerRef.current.pauseVideo();
      stopTimer();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    playerRef.current?.setVolume(volume * 100);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      try { playerRef.current?.destroy(); } catch (_) {}
    };
  }, []);

  return { currentTime, duration, seek };
}
