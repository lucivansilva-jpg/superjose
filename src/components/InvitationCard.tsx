import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Gift,
  CheckCircle2,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  PartyPopper
} from 'lucide-react';
import { VideoConfig } from '../types';
import { VideoPlayerFrame } from './VideoPlayerFrame';
import { soundEffects } from '../utils/soundEffects';


interface InvitationCardProps {
  videoConfig: VideoConfig;
  onOpenRsvp: () => void;
  onOpenLocation: () => void;
  onOpenGifts: () => void;
  onOpenGuestList: () => void;
  rsvpCount: number;
  initialTime?: number;
  onReplayIntro?: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  videoConfig,
  onOpenRsvp,
  onOpenLocation,
  onOpenGifts,
  onOpenGuestList,
  rsvpCount,
  initialTime = 0,
  onReplayIntro
}) => {
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Target date: 28 de Novembro at 10:00
  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(2026, 10, 28, 10, 0, 0).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
    if (!next) soundEffects.playCoin();
  };

  return (
    <div className="w-full flex flex-col items-center max-w-[420px] mx-auto">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between px-1 mb-2">
        <div>
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="py-1 px-3 rounded-full bg-slate-800/90 hover:bg-slate-700 text-yellow-300 font-bold text-[11px] border border-yellow-400/40 flex items-center gap-1 shadow transition-transform active:scale-95"
              title="Rever abertura de 8 segundos em tela cheia"
            >
              <span>🎬 Rever Abertura</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-yellow-400 text-slate-950 border-yellow-300 shadow'
            }`}
            title={isMuted ? 'Ativar sons' : 'Silenciar sons'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Invitation Card Container - Adapted for Mobile Screens */}
      <div className="relative w-full shadow-2xl rounded-[28px] overflow-hidden border-3 sm:border-4 border-yellow-400/90 ring-4 ring-yellow-500/20 bg-sky-900">
        {/* Aspect Ratio Box matching exact 941 / 1672 ratio */}
        <div className="relative w-full aspect-[941/1672] select-none">
          {/* Base Invitation Art (Untouched original photo & design) */}
          <img
            src="/assets/aistudio/convite-fundo.png"
            alt="Convite de Aniversário Super José"
            className="w-full h-full object-cover block"
            referrerPolicy="no-referrer"
          />

          {/* Video Billboard Overlay Frame */}
          <div
            className="absolute z-10 overflow-hidden shadow-inner bg-black"
            style={{
              top: '3.3%',
              left: '5.0%',
              width: '89.9%',
              height: '28.65%',
              borderRadius: '20px'
            }}
          >
            <VideoPlayerFrame
              config={videoConfig}
              isInteractive={true}
              initialTime={initialTime}
            />
          </div>

          {/* Interactive Tap Zones over Image Buttons */}
          {/* Local: Zé da piscina */}
          <div
            onClick={() => {
              soundEffects.playCoin();
              onOpenLocation();
            }}
            title="Abrir mapa do Zé da piscina"
            className="absolute z-20 cursor-pointer rounded-2xl hover:bg-white/15 active:bg-white/30 transition-colors"
            style={{
              top: '69.4%',
              left: '47.5%',
              width: '45.0%',
              height: '4.8%'
            }}
          />

        </div>
      </div>

      {/* Action Buttons Adapted for Mobile */}
      <div className="w-full mt-3.5 space-y-2.5">
        {/* Countdown Box */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600/90 via-amber-600/90 to-yellow-600/90 text-white shadow-lg border-2 border-yellow-300">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-yellow-200">
              <PartyPopper size={13} /> Contagem Regressiva
            </span>
            <span className="text-[11px] font-semibold text-white/90">28/11 às 10h</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-white/20">
              <span className="block text-lg font-mario text-yellow-300">{timeLeft.days}</span>
              <span className="text-[9px] uppercase font-bold text-slate-200">Dias</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-white/20">
              <span className="block text-lg font-mario text-yellow-300">{timeLeft.hours}</span>
              <span className="text-[9px] uppercase font-bold text-slate-200">Horas</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-white/20">
              <span className="block text-lg font-mario text-yellow-300">{timeLeft.minutes}</span>
              <span className="text-[9px] uppercase font-bold text-slate-200">Min</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-white/20">
              <span className="block text-lg font-mario text-yellow-300">{timeLeft.seconds}</span>
              <span className="text-[9px] uppercase font-bold text-slate-200">Seg</span>
            </div>
          </div>
        </div>

        {/* Primary Call-to-Actions for Guests */}
        <button
          onClick={() => {
            soundEffects.playCoin();
            onOpenRsvp();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-950/40 border-2 border-green-300 transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          <CheckCircle2 size={20} />
          <span>Confirmar Presença</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEffects.playCoin();
              onOpenLocation();
            }}
            className="py-3 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow border border-sky-300 transition-all active:scale-[0.98]"
          >
            <MapPin size={16} />
            <span>Como Chegar</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playCoin();
              onOpenGifts();
            }}
            className="py-3 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-600 shadow transition-all active:scale-[0.98]"
          >
            <Gift size={16} className="text-yellow-400" />
            <span>Ver Presentes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
