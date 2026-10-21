import React from 'react';
import { Home, Trophy, Target, Globe, Info } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'toppers', label: 'Toppers', icon: Trophy },
  { id: 'oqad', label: 'Daily Question', icon: Target },
  { id: 'abroad', label: 'Study Abroad', icon: Globe },
  { id: 'about', label: 'About Us', icon: Info },
];

interface DesktopNavProps {
  theme: 'dark' | 'light';
  activeId: string;
  onSelect: (id: string) => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  theme,
  activeId,
  onSelect,
}) => {
  const isDark = theme === 'dark';

  return (
    <nav
      aria-label="Main navigation"
      className="desktop-nav hidden items-center gap-3 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`desktop-nav-button group relative flex h-11 min-w-[58px] shrink-0 cursor-pointer select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-2 rounded-xl text-[10px] font-medium transition-all duration-300 ${
              isActive
                ? isDark
                  ? 'desktop-nav-button--active-dark text-[#CCFF00] bg-white/5'
                  : 'desktop-nav-button--active-light text-[#0066FF] bg-black/5'
                : isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Icon
              className={`desktop-nav-icon h-[16px] w-[16px] shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 ${
                isActive
                  ? isDark
                    ? 'text-[#CCFF00]'
                    : 'text-[#0066FF]'
                  : ''
              }`}
              strokeWidth={2.4}
            />
            <span className="desktop-nav-caption leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface MobileBottomNavProps {
  theme: 'dark' | 'light';
  activeId: string;
  onSelect: (id: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  theme,
  activeId,
  onSelect,
}) => {
  const isDark = theme === 'dark';

  return (
    <nav
      className={`md:hidden fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-2xl border shadow-xl backdrop-blur-xl transition-all px-2 py-1.5 ${
        isDark
          ? 'bg-[#0a0a0c]/90 border-zinc-800 text-zinc-300 shadow-black/60'
          : 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-300/40'
      }`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive
                  ? isDark
                    ? 'text-[#CCFF00]'
                    : 'text-[#0066FF]'
                  : isDark
                  ? 'text-zinc-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-[#CCFF00]/15'
                      : 'bg-[#0066FF]/10'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.4} />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5 line-clamp-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
