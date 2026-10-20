import React from 'react';
import { Logo } from './Logo.tsx';
import { BrandName } from './BrandName.tsx';
import { MapPin, Mail, ShieldAlert } from 'lucide-react';

interface FooterProps {
  theme: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <footer
      className={`border-t py-12 transition-colors ${
        isDark
          ? 'bg-[#050505] border-zinc-900 text-zinc-400'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Grid: Brand & Contact Info */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand Info */}
          <div className="max-w-sm">
            <Logo theme={theme} size="sm" className="mb-3" />
            <p className="text-xs leading-relaxed text-zinc-400">
              Personalized 1-on-1 mentorship for NEET UG aspirants by top All India Rankers.
            </p>
          </div>

          {/* Contact Details */}
          <div className="text-xs font-mono space-y-4">
            <div>
              <div className={`font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Address
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`} />
                <span>Jaipur 302018, India</span>
              </div>
            </div>

            <div>
              <div className={`font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Support Email
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href="mailto:csebks@gmail.com" className="hover:underline text-neutral-200">
                  csebks@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal, Trademark & Copyright Disclaimer Section */}
        <div
          className={`pt-6 border-t space-y-3 text-[11px] font-mono leading-relaxed ${
            isDark ? 'border-zinc-900 text-zinc-500' : 'border-slate-200 text-slate-500'
          }`}
        >
          {/* Trademark Disclaimer */}
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
            <p>
              <strong className={isDark ? 'text-zinc-400' : 'text-slate-700'}>Disclaimer:</strong>{' '}
              NEET is a registered trademark of the National Testing Agency (NTA). AIR NEETwork is an independent platform and is not affiliated with, endorsed by, or associated with NTA.
            </p>
          </div>

          {/* Copyright Notice */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-dashed border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <span>&copy; {new Date().getFullYear()}</span>
              <BrandName theme={theme} className="text-[11px]" />
              <span>· Jaipur 302018. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
