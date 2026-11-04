import React, { useState } from 'react';
import { X, CheckCircle, Send, Users, MessageSquare, Phone, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/soundEffects';
import { GuestRSVP } from '../types';

const ORGANIZER_WHATSAPP = '5585997100747';
const ORGANIZER_PHONE_DISPLAY = '(85) 99710-0747';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rsvp: GuestRSVP) => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, viaWhatsApp = false) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEffects.play1Up();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const newRsvp: GuestRSVP = {
      id: 'rsvp_' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      adults: Number(adults),
      children: Number(children),
      attendance: 'yes',
      notes: message.trim(),
      timestamp: Date.now()
    };

    onConfirm(newRsvp);
    setIsSubmitted(true);

    if (viaWhatsApp) {
      const totalPeople = Number(adults) + Number(children);
      const textMsg = encodeURIComponent(
        `🍄 *CONFIRMAÇÃO DE PRESENÇA - ANIVERSÁRIO SUPER JOSÉ* 🌟\n\n` +
        `Olá! Eu confirmo minha presença no aniversário!\n\n` +
        `👤 *Nome:* ${name}\n` +
        `👥 *Total de pessoas:* ${totalPeople} (${adults} adulto(s) e ${children} criança(s))\n` +
        (phone ? `📱 *Telefone:* ${phone}\n` : '') +
        (message ? `💬 *Recadinho:* ${message}\n` : '') +
        `\n📅 *Data:* 28 de Novembro (Sábado) às 10:00\n` +
        `📍 *Local:* Zé da piscina\n\n` +
        `Mal podemos esperar para comemorar juntos! 🎮🎂🏊‍♂️`
      );
      window.open(`https://api.whatsapp.com/send?phone=${ORGANIZER_WHATSAPP}&text=${textMsg}`, '_blank');
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setAdults(1);
    setChildren(1);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border-4 border-yellow-400 shadow-2xl p-6 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🍄</span>
            <div>
              <h2 className="text-2xl font-mario text-yellow-400 drop-shadow">
                Confirmar Presença
              </h2>
              <p className="text-xs text-slate-300">
                28 de Novembro · 10:00 · Zé da Piscina
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center ring-4 ring-green-500/30">
              <CheckCircle size={38} />
            </div>
            <h3 className="text-2xl font-mario text-green-400">
              Presença Confirmada!
            </h3>
            <p className="text-sm text-slate-200 max-w-sm mx-auto">
              Oba! Sua presença foi registrada com sucesso! Preparamos um dia incrível de muita diversão, água e aventuras no mundo do Mario!
            </p>
            <div className="pt-4 flex flex-col gap-2 sm:flex-row justify-center">
              <button
                onClick={() => {
                  const totalPeople = Number(adults) + Number(children);
                  const textMsg = encodeURIComponent(
                    `🍄 *CONFIRMAÇÃO - ANIVERSÁRIO SUPER JOSÉ* 🌟\n` +
                    `Olá! Confirmo presença: ${name} (${totalPeople} pessoas: ${adults} adultos, ${children} crianças).\n` +
                    `Nos vemos no Zé da Piscina dia 28/11!`
                  );
                  window.open(`https://api.whatsapp.com/send?phone=${ORGANIZER_WHATSAPP}&text=${textMsg}`, '_blank');
                }}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Send size={18} />
                Enviar para WhatsApp ({ORGANIZER_PHONE_DISPLAY})
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-yellow-400" />
                Seu Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tio Lucas e Família"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone size={14} className="text-yellow-400" />
                Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-yellow-400" />
                  Adultos
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg text-yellow-300">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  Crianças
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg text-yellow-300">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-yellow-400" />
                Mensagem para o Aniversariante (Opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Deixe um recadinho carinhoso..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-sm"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send size={16} />
                Confirmar no WhatsApp ({ORGANIZER_PHONE_DISPLAY})
              </button>
              <button
                type="submit"
                className="py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle size={16} />
                Salvar no Site
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
