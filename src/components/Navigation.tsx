import React from 'react';
import { Home, Trophy, Target, Globe, Info, LayoutDashboard, GraduationCap, CheckSquare } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'toppers', label: 'Toppers', icon: Trophy },
  { id: 'syllabus_tracker', label: 'Syllabus Tracker', icon: CheckSquare },
  { id: 'aspirant_dashboard', label: 'Aspirant Portal', icon: GraduationCap },
  { id: 'oqad', label: 'Daily Question', icon: Target },
  { id: 'about', label: 'About Us', icon: Info },
];

export const MENTOR_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Topper Portal', icon: LayoutDashboard },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'toppers', label: 'Toppers', icon: Trophy },
  { id: 'syllabus_tracker', label: 'Syllabus Tracker', icon: CheckSquare },
  { id: 'aspirant_dashboard', label: 'Aspirant Portal', icon: GraduationCap },
  { id: 'oqad', label: 'Daily Question', icon: Target },
  { id: 'about', label: 'About Us', icon: Info },
];

interface DesktopNavProps {
  theme: 'dark' | 'light';
  activeId: string;
  onSelect: (id: string) => void;
  isMentor?: boolean;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  theme,
  activeId,
  onSelect,
  isMentor = false,
}) => {
  const isDark = theme === 'dark';
  const navList = isMentor ? MENTOR_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav
      aria-label="Main navigation"
      className="desktop-nav hidden items-center gap-1.5 lg:gap-2 md:flex"
    >
      {navList.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative flex items-center gap-2 px-3 py-2 lg:px-3.5 lg:py-2 rounded-xl text-sm font-semibold transition-all duration-200 select-none cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? isDark
                  ? 'bg-blue-500/15 text-[#60A5FA] border border-blue-500/30 shadow-sm'
                  : 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/25 shadow-sm'
                : isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
            }`}
          >
            <Icon
              className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive
                  ? isDark
                    ? 'text-[#60A5FA]'
                    : 'text-[#0066FF]'
                  : isDark
                  ? 'text-zinc-400 group-hover:text-white'
                  : 'text-slate-500 group-hover:text-slate-900'
              }`}
              strokeWidth={isActive ? 2.2 : 2}
            />
            <span className="leading-tight">{item.label}</span>
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
  isMentor?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  theme,
  activeId,
  onSelect,
  isMentor = false,
}) => {
  const isDark = theme === 'dark';
  const navList = isMentor ? MENTOR_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav
      className={`md:hidden fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-lg rounded-2xl border shadow-2xl backdrop-blur-xl transition-all px-2 py-2 ${
        isDark
          ? 'bg-[#0a0a0c]/95 border-zinc-800 text-zinc-300 shadow-black/70'
          : 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-300/60'
      }`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto gap-1">
        {navList.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-[54px] flex-1 ${
                isActive
                  ? isDark
                    ? 'text-[#60A5FA]'
                    : 'text-[#0066FF]'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-blue-500/20 text-[#60A5FA]'
                      : 'bg-[#0066FF]/15 text-[#0066FF]'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
              </div>
              <span
                className={`text-xs tracking-tight mt-0.5 line-clamp-1 ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
