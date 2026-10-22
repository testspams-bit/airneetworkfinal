import React from 'react';
import { X } from 'lucide-react';
import { BookingPaymentFlow } from './BookingPaymentFlow.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  initialMentor?: string;
  initialTier?: string;
  initialMode?: 'choose_topper' | 'diagnostic_test';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  theme,
  initialMentor,
  initialTier,
  initialMode,
}) => {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative border ${
          isDark
            ? 'bg-[#0E0E10] border-zinc-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <BookingPaymentFlow
          theme={theme}
          initialMentor={initialMentor}
          initialTier={initialTier}
          initialMode={initialMode}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
