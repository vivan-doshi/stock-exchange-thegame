import React from 'react';
import { Dialog } from '@headlessui/react';
import { cn } from '../../lib/utils';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={cn(
                    "w-full max-w-sm rounded-2xl p-6 shadow-2xl border",
                    "bg-slate-900",
                    type === 'success' ? "border-green-500/50" : type === 'error' ? "border-red-500/50" : "border-blue-500/50"
                )}>
                    <Dialog.Title className={cn(
                        "text-xl font-bold mb-2",
                        type === 'success' ? "text-green-400" : type === 'error' ? "text-red-400" : "text-blue-400"
                    )}>
                        {title}
                    </Dialog.Title>
                    <div className="text-slate-300 mb-6">
                        {message}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className={cn(
                                "px-4 py-2 rounded-lg font-semibold transition-colors",
                                type === 'success' ? "bg-green-600 hover:bg-green-700 text-white" :
                                    type === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                                        "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                        >
                            Okay
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
