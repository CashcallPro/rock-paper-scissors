"use client";

import React from 'react';

interface HeaderButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  backgroundImage: string,
}

export function HeaderButton({ onClick, children, backgroundImage }: HeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-[40px] h-[40px] bg-no-repeat bg-center bg-contain text-white font-bold text-sm z-10
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                  transition-transform duration-150 ease-in-out
                  hover:scale-105 active:scale-95`}
      style={{ backgroundImage: backgroundImage }}
    >
      {children}
    </button>
  );
}
