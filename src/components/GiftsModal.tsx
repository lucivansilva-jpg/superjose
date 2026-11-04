import React, { useState } from 'react';
import { X, Gift, Check, Sparkles, Heart } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface GiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftsModal: React.FC<GiftsModalProps> = ({ isOpen, onClose }) => {
  const [markedGifts, setMarkedGifts] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const toggleGift = (key: string) => {
    soundEffects.playCoin();
    setMarkedGifts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const giftItems = [
    {
      id: 'roupa',
      title: 'Roupas',
      sizes: 'Tamanhos: 6 anos e 8 anos',
      description: 'Camisetas divertidas, bermudas leves, conjuntos temáticos ou roupas de praia/piscina.',
      emoji: '👕'
    },
    {
      id: 'calcado',
      title: 'Calçados',
      sizes: 'Numeração: 30 / 31',
      description: 'Tênis esportivo confortável, crocs ou chinelos para brincar no dia a dia.',
      emoji: '👟'
    },
    {
      id: 'perfume',
      title: 'Perfume & Cuidados',
      sizes: 'Linha infantil',
      description: 'Colônias infantis suaves, kits de banho ou cheirinhos agradáveis.',
      emoji: '🧴'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border-4 border-yellow-400 shadow-2xl p-6 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎁</span>
            <div>
              <h2 className="text-2xl font-mario text-yellow-400 drop-shadow">
                Sugestões de Presentes
              </h2>
              <p className="text-xs text-slate-300">
                Itens indicados com carinho para o aniversariante
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

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300">
            Sua presença é o nosso maior presente! Se desejar presentear, aqui estão os tamanhos e preferências:
          </p>

          <div className="space-y-3 pt-1">
            {giftItems.map((item) => {
              const isMarked = !!markedGifts[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleGift(item.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isMarked
                      ? 'bg-yellow-500/10 border-yellow-400/80 ring-2 ring-yellow-400/30'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            {item.title}
                          </h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                            {item.sizes}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isMarked
                          ? 'bg-yellow-400 border-yellow-400 text-slate-900 font-bold'
                          : 'border-slate-600 bg-slate-900/60'
                      }`}
                    >
                      {isMarked && <Check size={16} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
            <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
              <Heart size={14} className="text-red-400 fill-red-400" />
              Obrigado pelo carinho e por fazer parte desse momento tão especial!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-extrabold text-sm transition-all shadow-lg"
            >
              Entendido!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
