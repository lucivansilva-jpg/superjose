import React from 'react';
import { X, Users, Trash2, Share2, UserCheck, MessageSquare, Phone } from 'lucide-react';
import { GuestRSVP } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvps: GuestRSVP[];
  onRemoveRsvp: (id: string) => void;
  onClearAll: () => void;
}

export const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  onClose,
  rsvps,
  onRemoveRsvp,
  onClearAll
}) => {
  if (!isOpen) return null;

  const totalAdults = rsvps.reduce((acc, r) => acc + (r.adults || 0), 0);
  const totalChildren = rsvps.reduce((acc, r) => acc + (r.children || 0), 0);
  const totalPeople = totalAdults + totalChildren;

  const handleShareSummary = () => {
    soundEffects.playCoin();
    let text = `🍄 *LISTA DE CONFIRMADOS - ANIVERSÁRIO MARIO* 🌟\n\n`;
    text += `📊 *Resumo:* ${totalPeople} pessoas (${totalAdults} adultos e ${totalChildren} crianças)\n\n`;
    rsvps.forEach((r, idx) => {
      text += `${idx + 1}. *${r.name}* (${r.adults}A + ${r.children}C)`;
      if (r.phone) text += ` - 📱 ${r.phone}`;
      if (r.notes) text += `\n   "${r.notes}"`;
      text += `\n`;
    });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border-4 border-yellow-400 shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-2xl font-mario text-yellow-400 drop-shadow">
                Lista de Convidados
              </h2>
              <p className="text-xs text-slate-300">
                {rsvps.length} confirmaç{rsvps.length === 1 ? 'ão' : 'ões'} registrada{rsvps.length === 1 ? '' : 's'}
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

        {/* Totals Summary */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
            <span className="block text-2xl font-bold text-yellow-300 font-mono">{totalPeople}</span>
            <span className="text-xs text-slate-300 font-medium">Total de Pessoas</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
            <span className="block text-2xl font-bold text-sky-300 font-mono">{totalAdults}</span>
            <span className="text-xs text-slate-300 font-medium">Adultos</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
            <span className="block text-2xl font-bold text-emerald-300 font-mono">{totalChildren}</span>
            <span className="text-xs text-slate-300 font-medium">Crianças</span>
          </div>
        </div>

        {/* Guests List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {rsvps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users size={40} className="mx-auto opacity-40 text-yellow-400" />
              <p className="text-sm">Nenhum convidado confirmou ainda.</p>
              <p className="text-xs text-slate-500">
                Quando os convidados preencherem o formulário no convite, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700 flex items-start justify-between gap-3 hover:bg-slate-800 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-green-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{rsvp.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-mono">
                      {rsvp.adults + rsvp.children} pessoas
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-3">
                    <span>Adultos: {rsvp.adults}</span>
                    <span>·</span>
                    <span>Crianças: {rsvp.children}</span>
                    {rsvp.phone && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Phone size={12} /> {rsvp.phone}
                        </span>
                      </>
                    )}
                  </div>
                  {rsvp.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-lg mt-1 flex items-start gap-1.5">
                      <MessageSquare size={13} className="shrink-0 text-yellow-400/80 mt-0.5" />
                      "{rsvp.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveRsvp(rsvp.id)}
                  title="Remover confirmação"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between gap-3 mt-4">
          {rsvps.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Limpar lista
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {rsvps.length > 0 && (
              <button
                onClick={handleShareSummary}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Share2 size={15} />
                Exportar no WhatsApp
              </button>
            )}
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
