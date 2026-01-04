import React, { useMemo } from 'react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../../types';

interface PlayerHandProps {
    cards: CardType[];
    onCardClick?: (card: CardType) => void;
    selectedCardIds?: string[];
    disabled?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
    cards,
    onCardClick,
    selectedCardIds = [],
    disabled
}) => {

    // Sort cards: Price cards by Company (Alphabetical), then Value. Special cards last.
    const sortedCards = useMemo(() => {
        return [...cards].sort((a, b) => {
            if (a.type === 'price' && b.type !== 'price') return -1;
            if (a.type !== 'price' && b.type === 'price') return 1;

            if (a.type === 'price' && b.type === 'price') {
                if (a.companyId !== b.companyId) {
                    return (a.companyId || '').localeCompare(b.companyId || '');
                }
                return (a.value || 0) - (b.value || 0);
            }
            return a.type.localeCompare(b.type);
        });
    }, [cards]);

    return (
        <div className="fixed bottom-0 left-0 right-0 py-4 px-8 bg-slate-900/90 backdrop-blur-md border-t border-slate-700 overflow-x-auto z-50">
            <div className="flex items-center justify-center gap-[-40px] min-w-max px-8">
                {sortedCards.map((card, index) => (
                    <div
                        key={card.id}
                        className="transition-transform hover:z-10 hover:-translate-y-4"
                        style={{
                            marginLeft: index === 0 ? 0 : '-40px',
                            zIndex: index
                        }}
                    >
                        <CardComponent
                            card={card}
                            onClick={onCardClick}
                            disabled={disabled}
                            selected={selectedCardIds.includes(card.id)}
                        />
                    </div>
                ))}
                {sortedCards.length === 0 && (
                    <div className="text-slate-400 italic">No cards in hand</div>
                )}
            </div>
        </div>
    );
};
