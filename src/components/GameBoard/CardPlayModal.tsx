import React from 'react';
import { Dialog } from '@headlessui/react';
import { Card } from '../../types';

interface CardPlayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    card: Card | null;
    isProcessing: boolean;
}

export const CardPlayModal: React.FC<CardPlayModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    card,
    isProcessing
}) => {
    if (!card) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                    <Dialog.Title className="text-xl font-bold text-white mb-4">
                        Play Card?
                    </Dialog.Title>

                    <div className="mb-6">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {card.type.replace(/-/g, ' ')}
                            </span>
                            <div className="text-2xl font-bold text-white">
                                {card.value ? `$${card.value}` : 'Effect Card'}
                            </div>
                        </div>
                        <p className="mt-4 text-slate-300 text-sm text-center">
                            {getCardDescription(card.type)}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Playing...' : 'Confirm Play'}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

function getCardDescription(type: string): string {
    switch (type) {
        case 'rights-issued': return "Buy 1 share for every 2 you own at $10/share.";
        case 'debenture': return "Award $2000 if any company has hit $0.";
        case 'currency-plus': return "Increase your cash by 10%.";
        case 'currency-minus': return "Decrease your cash by 10%.";
        case 'loan-stocks-matured': return "Receive $100,000 from matured loans.";
        default: return "Play this special card to activate its effect.";
    }
}
