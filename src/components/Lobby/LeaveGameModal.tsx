import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';

interface LeaveGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isHost: boolean;
}

const LeaveGameModal: React.FC<LeaveGameModalProps> = ({ isOpen, onClose, onConfirm, isHost }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-full">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-white"
                                    >
                                        Leave Game?
                                    </Dialog.Title>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-slate-300">
                                        {isHost
                                            ? 'You are the host. Leaving will ended the game for everyone and delete the lobby. This action cannot be undone.'
                                            : 'Are you sure you want to leave this game? You will return to the lobby.'}
                                    </p>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors shadow-lg shadow-red-900/20"
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                    >
                                        {isHost ? 'End Game & Leave' : 'Leave Game'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default LeaveGameModal;
