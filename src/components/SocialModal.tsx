import React, { useEffect } from 'react';
import { X, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { BrandName } from './BrandName.tsx';
import { Logo } from './Logo.tsx';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const SocialModal: React.FC<SocialModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border transition-all ${
          isDark
            ? 'bg-[#111114] border-zinc-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header with Logo Image & air.neetwork */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="relative shrink-0 flex items-center justify-center">
            <Logo theme={theme} size="sm" showText={false} />
          </div>
          <div className="flex flex-col text-left">
            <BrandName theme={theme} className="text-lg leading-tight" />
            <p className="text-xs text-zinc-400 mt-0.5">
              Official community & channels
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 hover:border-[#CCFF00] hover:text-[#CCFF00]'
                : 'bg-slate-50 border-slate-200 hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-white'
            }`}
          >
            <div className="relative">
              <Instagram className="w-7 h-7 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">Instagram</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 hover:border-[#CCFF00] hover:text-[#CCFF00]'
                : 'bg-slate-50 border-slate-200 hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-white'
            }`}
          >
            <div className="relative">
              <Youtube className="w-7 h-7 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
