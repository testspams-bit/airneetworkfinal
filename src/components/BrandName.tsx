import React from 'react';

interface BrandNameProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandName: React.FC<BrandNameProps> = ({
  className = '',
  theme = 'dark',
}) => {
  return (
    <span className={`font-black lowercase tracking-tight inline-flex items-baseline ${className}`}>
      <span>air.</span>
      <span className={theme === 'dark' ? 'text-[#CCFF00]' : 'text-[#0066FF]'}>
        neet
      </span>
      <span>work</span>
    </span>
  );
};
