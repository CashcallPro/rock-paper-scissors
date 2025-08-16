"use client";

import React from 'react';
import { IMAGES } from "@/lib/image-constants";

interface BattleButtonProps {
  onClick: () => void;
  disabled: boolean;
  title?: string;
  backgroundImage?: string;
}

export function BattleButton({ onClick, disabled, title = "BATTLE", backgroundImage = `url('${IMAGES.BUTTON}')` }: BattleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-[250px] h-[80px] bg-no-repeat bg-center bg-contain text-white font-bold text-2xl z-10
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                  transition-transform duration-150 ease-in-out
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      style={{ backgroundImage }}
    >
      {title}
    </button>
  );
}
