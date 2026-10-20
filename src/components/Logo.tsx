import React from 'react';
import { BrandName } from './BrandName.tsx';
import logoLight from '../../resources/air-logo-light.png';
import logoDark from '../../resources/air-logo-dark.png';

interface LogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  theme = 'dark',
  size = 'md',
  showTagline = false,
  showText = true,
}) => {
  // Proportional dimensions for standard navbar
  const sizeClasses = {
    sm: 'h-9 w-9 sm:h-10 sm:w-10',
    md: 'h-14 w-14 sm:h-16 sm:w-16',
    lg: 'h-24 w-24 sm:h-28 sm:w-28',
  }[size];

  const textSizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  // Guaranteed bundled assets
  const logoSrc = theme === 'light' ? logoLight : logoDark;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Actual Air NEETwork Logo on the LEFT */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={logoSrc}
          alt="Air NEETwork"
          className={`${sizeClasses} object-contain rounded-xl transition-transform duration-200 group-hover:scale-105`}
        />
      </div>

      {/* air.neetwork text to the RIGHT with neet in accent color */}
      {showText && (
        <div className="flex flex-col text-left">
          <BrandName
            theme={theme}
            className={`${textSizeClasses} leading-none`}
          />
          {showTagline && (
            <span
              className={`text-[10px] sm:text-xs tracking-widest uppercase font-semibold mt-1 ${
                theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'
              }`}
            >
              All India Rank Mentorship
            </span>
          )}
        </div>
      )}
    </div>
  );
};
