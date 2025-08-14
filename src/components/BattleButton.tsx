"use client";

import React from 'react';

interface BattleButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function BattleButton({ onClick, disabled }: BattleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-[250px] h-[80px] bg-no-repeat bg-center bg-contain text-white font-bold text-2xl z-10
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                  transition-transform duration-150 ease-in-out
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      style={{ backgroundImage: "url('/button.png')" }}
    >
      BATTLE
    </button>
  );
}
