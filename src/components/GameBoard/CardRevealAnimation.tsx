import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Card {
  id: string;
  type: 'price' | 'special';
  stock?: string;
  value?: number;
  specialType?: string;
}

interface CardRevealAnimationProps {
  cards: Card[];
  onRevealComplete?: () => void;
}

const CardRevealAnimation: React.FC<CardRevealAnimationProps> = ({
  cards,
  onRevealComplete
}) => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    if (cards.length === 0) return;

    // Reveal cards one by one with a delay
    cards.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index]);
      }, index * 500); // 500ms delay between each card
    });

    // Call onRevealComplete after all cards are revealed
    const totalDuration = cards.length * 500 + 1000; // Extra 1s at the end
    setTimeout(() => {
      onRevealComplete?.();
    }, totalDuration);

    return () => {
      setVisibleCards([]);
    };
  }, [cards, onRevealComplete]);

  if (cards.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Card Reveal
        </h2>

        <div className="flex gap-4 justify-center flex-wrap">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`transition-all duration-500 transform ${
                visibleCards.includes(index)
                  ? 'opacity-100 scale-100 rotate-0'
                  : 'opacity-0 scale-50 rotate-180'
              }`}
            >
              <div className={`
                w-40 h-56 rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center
                ${card.type === 'price'
                  ? card.value && card.value > 0
                    ? 'bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-400'
                    : 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400'
                  : 'bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400'
                }
              `}>
                {card.type === 'price' ? (
                  <>
                    <div className="text-white/80 text-sm font-medium mb-2 text-center">
                      {card.stock}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {card.value && card.value > 0 ? (
                        <TrendingUp className="w-8 h-8 text-white" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="text-4xl font-bold text-white">
                      {card.value && card.value > 0 ? '+' : ''}{card.value}
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      Price Change
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 text-white mb-3" />
                    <div className="text-white font-bold text-center text-sm">
                      {card.specialType?.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div className="text-white/60 text-xs mt-2 text-center">
                      Special Card
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Revealing cards...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRevealAnimation;
