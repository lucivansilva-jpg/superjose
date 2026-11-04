import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Upload } from 'lucide-react';
import { VideoConfig } from '../types';
import { buildYouTubeEmbedUrl } from '../utils/videoStorage';
import { soundEffects } from '../utils/soundEffects';

interface VideoPlayerFrameProps {
  config: VideoConfig;
  isInteractive?: boolean;
  initialTime?: number;
}

export const VideoPlayerFrame: React.FC<VideoPlayerFrameProps> = ({
  config,
  isInteractive = true,
  initialTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(config.muted);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(config.muted);
  }, [config.muted]);

  useEffect(() => {
    if (videoRef.current && config.type !== 'youtube') {
      if (initialTime > 0) {
        try {
          videoRef.current.currentTime = initialTime;
        } catch {}
      }
      videoRef.current.muted = isMuted;
      if (config.autoplay) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        });
      }
    }
  }, [config.src, config.type, config.autoplay, initialTime]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playCoin();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playCoin();
    setHasInteracted(true);
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const unmuteAndPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.play1Up();
    setHasInteracted(true);
    setIsMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playCoin();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const isYouTube = config.type === 'youtube' && config.youtubeId;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={() => {
        if (!isYouTube) {
          setShowControls(prev => !prev);
        }
      }}
      className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center select-none group"
      style={{
        borderRadius: 'inherit'
      }}
    >
      {/* Video Content adjusted to fill the billboard frame */}
      {isYouTube ? (
        <iframe
          src={buildYouTubeEmbedUrl(config.youtubeId!, {
            autoplay: config.autoplay,
            muted: config.muted,
            loop: config.loop
          })}
          title={config.caption || 'Vídeo de Aniversário'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={config.src}
          playsInline
          loop={config.loop}
          muted={isMuted}
          autoPlay={config.autoplay}
          className="w-full h-full object-cover object-center"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (!config.loop) setIsPlaying(false);
          }}
        />
      )}

      {/* Prominent Unmute Banner if muted on first load */}
      {isInteractive && !isYouTube && isMuted && !hasInteracted && isPlaying && (
        <button
          onClick={unmuteAndPlay}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 py-1.5 px-3.5 rounded-full bg-black/85 hover:bg-yellow-500 text-yellow-300 hover:text-slate-900 border border-yellow-400/80 shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-bounce transition-all hover:scale-105 active:scale-95"
        >
          <Volume2 size={16} />
          <span>Toque para Ativar Som</span>
        </button>
      )}

      {/* Optional Caption Overlay */}
      {config.caption && (
        <div className="absolute top-2 left-3 right-3 z-10 pointer-events-none">
          <span className="inline-block px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-yellow-300 text-[11px] font-bold tracking-wide drop-shadow truncate max-w-full">
            ⭐ {config.caption}
          </span>
        </div>
      )}

      {/* Interactive Controls Overlay for HTML5 video */}
      {isInteractive && !isYouTube && (
        <div
          className={`absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                title={isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFullscreen}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
                title="Tela Cheia"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If interactive and paused, center play button */}
      {isInteractive && !isYouTube && !isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-yellow-400/90 hover:bg-yellow-400 text-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-20"
          title="Reproduzir Vídeo"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
      )}
    </div>
  );
};
