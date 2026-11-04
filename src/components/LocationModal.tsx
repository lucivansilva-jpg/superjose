import React from 'react';
import { X, MapPin, Navigation, ExternalLink, Waves } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const locationName = 'Zé da Piscina';
  const mapsSearchUrl = 'https://maps.app.goo.gl/8ZAJj8mowhAYbgo66';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border-4 border-yellow-400 shadow-2xl p-6 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📍</span>
            <div>
              <h2 className="text-2xl font-mario text-yellow-400 drop-shadow">
                Como Chegar
              </h2>
              <p className="text-xs text-slate-300">
                Local da comemoração: Zé da piscina
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl mt-0.5">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {locationName}
                </h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Área de lazer com piscina para diversão de toda a família!
                </p>
                <div className="mt-2 text-xs text-yellow-300 font-semibold flex items-center gap-1.5">
                  <span>📅 28 de Novembro (Sábado)</span>
                  <span>·</span>
                  <span>⏰ Início às 10:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dica da piscina */}
          <div className="p-3.5 bg-blue-950/60 rounded-xl border border-blue-500/30 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
              <Waves size={20} />
            </div>
            <p className="text-xs text-blue-200">
              <strong>Dica especial:</strong> Não esqueçam de trazer roupas de banho, toalha e protetor solar para aproveitar a piscina!
            </p>
          </div>

          {/* Action button: Only Open in Google Maps */}
          <div className="pt-2">
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEffects.playCoin()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Navigation size={18} />
              <span>Abrir no Google Maps</span>
              <ExternalLink size={15} className="opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
