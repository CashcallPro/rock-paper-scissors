"use client";

import React from 'react';
import { UserProfile } from '../../lib/types';
import Image from 'next/image';
import { IMAGES } from '@/lib/image-constants';

interface PlayingHeaderProps {
  user: UserProfile | null;
  opponent: UserProfile | null;
  userScore: number;
  opponentScore: number;
  userCoins: number;
  coinChange: number;
}

const PlayingHeader: React.FC<PlayingHeaderProps> = ({ user, opponent, userScore, opponentScore, userCoins, coinChange }) => {
  const renderUserProfile = (profile: UserProfile | null, isOpponent: boolean = false) => {
    if (!profile) {
      return (
        <div className={`flex items-center ${isOpponent ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gray-500 m-2 flex items-center justify-center">
            <Image src={IMAGES.ARMOR} alt="default avatar" width={32} height={32} />
          </div>
          <span className="font-bold text-lg">Waiting...</span>
        </div>
      );
    }

    return (
      <div className={`flex-1 flex items-center ${isOpponent ? 'flex-row-reverse' : ''}`}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} alt={profile.username} width={40} height={40} className="w-10 h-10 rounded-full m-2" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 m-2 flex items-center justify-center">
            <Image src={IMAGES.ARMOR} alt={profile.username} width={32} height={32} />
          </div>
        )}
        <div className={`flex flex-col ${isOpponent ? 'items-end' : 'items-start'}`}>
          <span className="font-bold text-lg">{profile.username}</span>
          {!isOpponent && (
            <div className="flex items-center">
              <Image src={IMAGES.GEM} alt="gem" width={16} height={16} />
              <span className="ml-1 font-bold text-sm">{userCoins}</span>
              {coinChange !== 0 && (
                <span
                  className={`ml-2 font-bold text-sm ${
                    coinChange > 0 ? 'text-green-500' : 'text-red-500'
                  } animate-ping`}
                >
                  {coinChange > 0 ? `+${coinChange}` : coinChange}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
      {renderUserProfile(user)}
      <div className="flex items-center text-lg font-bold text-[#FFC81D]">
        <span>{userScore}</span>
        <span className="mx-2">-</span>
        <span>{opponentScore}</span>
      </div>
      {renderUserProfile(opponent, true)}
    </div>
  );
};

export default PlayingHeader;
