"use client";

import React, { forwardRef } from 'react';

interface HeaderButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  backgroundImage: string,
  disabled?: boolean;
}

export const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(({ onClick, children, backgroundImage, disabled }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-[46px] h-[42px] bg-no-repeat bg-center bg-contain text-white font-bold text-sm z-10
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                  transition-transform duration-150 ease-in-out
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      style={{ backgroundImage: backgroundImage }}
    >
      {children}
    </button>
  );
});

HeaderButton.displayName = 'HeaderButton';
