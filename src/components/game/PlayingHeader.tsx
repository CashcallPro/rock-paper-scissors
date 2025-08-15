"use client";

import React from 'react';
import { UserProfile } from '../../lib/types';
import Image from 'next/image';

interface PlayingHeaderProps {
  user: UserProfile | null;
  opponent: UserProfile | null;
  userScore: number;
  opponentScore: number;
}

const PlayingHeader: React.FC<PlayingHeaderProps> = ({ user, opponent, userScore, opponentScore }) => {
  const renderUserProfile = (profile: UserProfile | null, score: number, isOpponent: boolean = false) => {
    if (!profile) {
      return (
        <div className={`flex items-center ${isOpponent ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gray-500 m-2 flex items-center justify-center">
            <Image src="/armor.png" alt="default avatar" width={32} height={32} />
          </div>
          <span className="font-bold text-lg">Waiting...</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center ${isOpponent ? 'flex-row-reverse' : ''}`}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} alt={profile.username} width={40} height={40} className="w-10 h-10 rounded-full m-2" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 m-2 flex items-center justify-center">
            <Image src="/armor.png" alt={profile.username} width={32} height={32} />
          </div>
        )}
        <span className="font-bold text-lg">{profile.username}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
      {renderUserProfile(user, userScore)}
      <div className="flex items-center text-lg font-bold">
        <span>{userScore}</span>
        <span className="mx-2">-</span>
        <span>{opponentScore}</span>
      </div>
      {renderUserProfile(opponent, opponentScore, true)}
    </div>
  );
};

export default PlayingHeader;
