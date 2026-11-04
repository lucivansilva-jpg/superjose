import React, { useState, useEffect } from 'react';

import { VideoConfig, GuestRSVP } from './types';
import {
  loadVideoConfig,
  saveVideoConfig,
  loadVideoFileFromDB
} from './utils/videoStorage';
import { soundEffects } from './utils/soundEffects';
import { InvitationCard } from './components/InvitationCard';
import { IntroVideoScreen } from './components/IntroVideoScreen';
import { RsvpModal } from './components/RsvpModal';
import { LocationModal } from './components/LocationModal';
import { GiftsModal } from './components/GiftsModal';
import { GuestListModal } from './components/GuestListModal';

const RSVPS_STORAGE_KEY = 'mario_convite_rsvps_list';

export default function App() {
  const [videoConfig, setVideoConfig] = useState<VideoConfig>(() => loadVideoConfig());
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [videoPlaybackTime, setVideoPlaybackTime] = useState<number>(0);
  const [rsvps, setRsvps] = useState<GuestRSVP[]>(() => {
    try {
      const saved = localStorage.getItem(RSVPS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal open states
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const [isGuestListOpen, setIsGuestListOpen] = useState(false);

  // Restore stored video blob from IndexedDB if previous upload exists
  useEffect(() => {
    async function restoreStoredBlob() {
      if (videoConfig.type === 'upload' || videoConfig.type === 'recorded') {
        const stored = await loadVideoFileFromDB();
        if (stored && stored.url) {
          setVideoConfig((prev) => ({
            ...prev,
            src: stored.url,
            originalName: stored.name
          }));
        }
      }
    }
    restoreStoredBlob();
  }, []);


  const handleAddRsvp = (newRsvp: GuestRSVP) => {
    setRsvps((prev) => {
      const updated = [newRsvp, ...prev];
      try {
        localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveRsvp = (id: string) => {
    setRsvps((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllRsvps = () => {
    if (confirm('Tem certeza de que deseja apagar a lista de presenças?')) {
      setRsvps([]);
      localStorage.removeItem(RSVPS_STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#071326] text-white flex flex-col items-center justify-start py-2 sm:py-4 px-2 select-none selection:bg-yellow-400 selection:text-slate-900">
      {/* 8-second Opening Video Screen */}
      {showIntro && (
        <IntroVideoScreen
          videoSrc={videoConfig.src}
          onComplete={(currTime) => {
            setVideoPlaybackTime(currTime);
            setShowIntro(false);
          }}
        />
      )}

      {/* Mobile-First Main Invitation Container */}
      <main className="w-full max-w-[420px] mx-auto flex flex-col items-center">
        {/* Invitation Card with Video in Top Billboard */}
        <InvitationCard
          videoConfig={videoConfig}
          onOpenRsvp={() => setIsRsvpOpen(true)}
          onOpenLocation={() => setIsLocationOpen(true)}
          onOpenGifts={() => setIsGiftsOpen(true)}
          onOpenGuestList={() => setIsGuestListOpen(true)}
          rsvpCount={rsvps.length}
          initialTime={videoPlaybackTime}
          onReplayIntro={() => setShowIntro(true)}
        />
      </main>

      {/* Modals */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        onConfirm={handleAddRsvp}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      <GiftsModal
        isOpen={isGiftsOpen}
        onClose={() => setIsGiftsOpen(false)}
      />

      <GuestListModal
        isOpen={isGuestListOpen}
        onClose={() => setIsGuestListOpen(false)}
        rsvps={rsvps}
        onRemoveRsvp={handleRemoveRsvp}
        onClearAll={handleClearAllRsvps}
      />
    </div>
  );
}
