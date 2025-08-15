"use client";

import Image from 'next/image';
import React from 'react';

interface GiftItemCardProps {
  icon: string;
  name: string;
  amount?: string | number;
  onUnlock: () => void;
}

export function GiftItemCard({ icon, name, amount, onUnlock }: GiftItemCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between text-white shadow-lg w-full">
      <div style={{ minWidth: '50px', minHeight: '50px' }} className="w-12 h-12 relative mr-4">
        <Image src={icon} alt="item icon" layout="fill" objectFit="contain" />
      </div>
      <div className="flex-1">
        <p className="text-xl font-bold">{name}</p>
        {amount && <p className="text-lg text-gray-400">{amount}</p>}
      </div>
      <button
        onClick={onUnlock}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Unlock
      </button>
    </div>
  );
}
