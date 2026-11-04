import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight, Play } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface IntroVideoScreenProps {
  videoSrc: string;
  onComplete: (currentTime: number) => void;
}

export const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({ videoSrc, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(8);
  const [isMuted, setIsMuted] = useState(false);
  const [needsUserTap, setNeedsUserTap] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try to play with sound
    video.muted = false;
    video.play().then(() => {
      setIsMuted(false);
    }).catch(() => {
      // Browser blocked autoplay with audio, fall back to muted
      video.muted = true;
      setIsMuted(true);
      video.play().then(() => {
        setNeedsUserTap(true);
      }).catch(() => {
        setNeedsUserTap(true);
      });
    });

    const startTime = Date.now();
    const DURATION_MS = 118000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((DURATION_MS - elapsed) / 1000));
      setSecondsRemaining(remaining);
      setProgressPct(Math.min(100, (elapsed / DURATION_MS) * 100));

      if (elapsed >= DURATION_MS) {
        clearInterval(interval);
        handleFinish();
      }
    }, 1000); // Changed interval to 1s for better perf over 118s

    return () => clearInterval(interval);
  }, []);

  const handleFinish = () => {
    if (isExiting) return;
    soundEffects.playCoin();
    setIsExiting(true);
    const currTime = videoRef.current ? videoRef.current.currentTime : 8;
    setTimeout(() => {
      onComplete(currTime);
    }, 650);
  };

  const handleUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playCoin();
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setIsMuted(false);
      setNeedsUserTap(false);
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
      setNeedsUserTap(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-between overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background/Main Video */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
        {/* Soft Vignette / Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Top Header: Mario badge & remaining countdown */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/40 shadow-lg">
          <span className="text-lg">⭐</span>
          <span className="font-mario text-yellow-300 text-xs tracking-wider">
            Super José · Convite
          </span>
        </div>

        {/* 1m 58s countdown timer badge */}
        <div className="bg-yellow-400 text-slate-950 font-mario px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1.5 animate-pulse">
          <span>Abrindo em {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Center Sound Notification if browser muted autoplay */}
      {needsUserTap && (
        <div className="relative z-20 my-auto text-center px-4">
          <button
            onClick={handleUnmute}
            className="py-3 px-6 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl border-2 border-yellow-200 animate-bounce transition-transform active:scale-95 mx-auto"
          >
            <Volume2 size={20} />
            <span>Toque para Ativar o Som 🔊</span>
          </button>
        </div>
      )}

      {/* Bottom Area: Progress bar & Skip to Invite Button */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 pb-6 space-y-3">
        {/* Progress Bar for the 8 seconds */}
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="bg-gradient-to-r from-yellow-400 to-amber-400 h-full transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Sound toggle button */}
          <button
            onClick={handleToggleSound}
            className="p-3 rounded-2xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-lg transition-transform active:scale-95"
            title={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={18} className="text-yellow-400" /> : <Volume2 size={18} className="text-green-400" />}
          </button>

          {/* Skip / Open invite button */}
          <button
            onClick={handleFinish}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 hover:from-green-500 hover:to-emerald-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl shadow-green-950/60 border-2 border-green-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Abrir Convite Agora</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
