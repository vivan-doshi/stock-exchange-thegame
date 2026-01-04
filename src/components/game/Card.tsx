import React from 'react';
import { Card as CardType } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, XCircle, RotateCcw } from 'lucide-react';

interface CardProps {
    card: CardType;
    onClick?: (card: CardType) => void;
    disabled?: boolean;
    selected?: boolean;
}

const STOCK_COLORS: Record<string, string> = {
    atlas_bank: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    titan_steel: 'bg-slate-100 text-slate-800 border-slate-200',
    global_industries: 'bg-blue-100 text-blue-800 border-blue-200',
    omega_energy: 'bg-amber-100 text-amber-800 border-amber-200',
    vitalcare_pharma: 'bg-rose-100 text-rose-800 border-rose-200',
    novatech: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const CARD_ICONS: Record<string, React.ReactNode> = {
    'loan-stocks-matured': <DollarSign className="w-5 h-5" />,
    'debenture': <AlertCircle className="w-5 h-5" />,
    'rights-issued': <TrendingUp className="w-5 h-5" />,
    'share-suspended': <XCircle className="w-5 h-5" />,
    'currency-plus': <TrendingUp className="w-5 h-5 text-green-600" />,
    'currency-minus': <TrendingDown className="w-5 h-5 text-red-600" />,
};

const CARD_LABELS: Record<string, string> = {
    'loan-stocks-matured': 'Loan Matured',
    'debenture': 'Debenture',
    'rights-issued': 'Rights Issued',
    'share-suspended': 'Share Suspended',
    'currency-plus': 'Market Boom',
    'currency-minus': 'Market Crash',
};

const CARD_DESCRIPTIONS: Record<string, string> = {
    'loan-stocks-matured': 'Collect $100,000 from Bank',
    'debenture': 'If stock hits 0, redeem for face value',
    'rights-issued': 'Buy 1 share for every 2 held @ $10',
    'share-suspended': 'Reset stock price to previous year',
    'currency-plus': '+10% to your Cash Balance',
    'currency-minus': '-10% from your Cash Balance',
};

export const Card: React.FC<CardProps> = ({ card, onClick, disabled, selected }) => {
    const isPriceCard = card.type === 'price';

    // Base style
    let cardStyle = "relative w-28 h-40 rounded-lg shadow-sm border-2 flex flex-col items-center justify-between p-2 flex-shrink-0 transition-all cursor-pointer hover:-translate-y-2";

    // Color logic
    let colorClass = "bg-white border-gray-200";
    if (isPriceCard && card.companyId) {
        colorClass = STOCK_COLORS[card.companyId] || colorClass;
    } else if (!isPriceCard) {
        // Special cards get a consistent distinct look
        colorClass = "bg-purple-50 border-purple-200 text-purple-900";
    }

    // Selection/Disabled states
    if (selected) cardStyle += " ring-4 ring-yellow-400 translate-y-[-8px]";
    if (disabled) cardStyle += " opacity-50 cursor-not-allowed hover:translate-y-0";

    return (
        <div
            className={cn(cardStyle, colorClass)}
            onClick={() => !disabled && onClick && onClick(card)}
        >
            {/* Header Icon/Value */}
            <div className="font-bold text-center w-full border-b border-black/10 pb-1">
                {isPriceCard ? (
                    <span className={cn("text-lg", (card.value || 0) > 0 ? "text-green-700" : "text-red-700")}>
                        {(card.value || 0) > 0 ? '+' : ''}{card.value}
                    </span>
                ) : (
                    <span className="text-xs uppercase tracking-tighter font-extrabold">{CARD_LABELS[card.type]}</span>
                )}
            </div>

            {/* Center Content */}
            <div className="flex-grow flex items-center justify-center text-center px-1">
                {isPriceCard ? (
                    <div className="text-xs font-semibold leading-tight opacity-80 uppercase break-words">
                        {card.companyId?.replace('_', ' ')}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        {CARD_ICONS[card.type] || <AlertCircle />}
                        <p className="text-[10px] leading-tight font-medium opacity-90">
                            {CARD_DESCRIPTIONS[card.type]}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer (Mirror Header for hand ease) */}
            <div className="rotate-180 font-bold text-center w-full border-b border-black/10 pb-1">
                {isPriceCard && (
                    <span className={cn("text-lg", (card.value || 0) > 0 ? "text-green-700" : "text-red-700")}>
                        {(card.value || 0) > 0 ? '+' : ''}{card.value}
                    </span>
                )}
            </div>
        </div>
    );
};
