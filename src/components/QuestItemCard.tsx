"use client";

import Image from 'next/image';
import React from 'react';

interface QuestItemCardProps {
  name: string;
  amount?: string | number;
  onUnlock: () => void;
  rewardImage: string;
  adImage?: string;
  isAd?: boolean;
}

export function QuestItemCard({ name, amount, onUnlock, rewardImage, adImage, isAd }: QuestItemCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between text-white shadow-lg w-full">
      <div style={{ minWidth: '100px', minHeight: '100px' }} className="w-24 h-24 relative mr-4">
        <Image src={rewardImage} alt="item icon" layout="fill" objectFit="contain" />
        {isAd && adImage && (
          <div
            className="absolute bottom-0 right-0 w-1/2 h-1/2"
            style={{
              width: '50%',
              height: '50%',
            }}
          >
            <Image src={adImage} alt="ad icon" layout="fill" objectFit="contain" />
          </div>
        )}
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
