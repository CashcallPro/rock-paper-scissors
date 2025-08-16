"use client";
import Image from 'next/image';

interface OpponentFoundScreenProps {
  myUsername: string | null;
  opponentUsername: string | null;
}

export function OpponentFoundScreen({ myUsername, opponentUsername }: OpponentFoundScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4">
      <h2 className="text-3xl font-medium text-green-600 z-10">Opponent found!</h2>
      <p className="text-2xl mt-2 text-white z-10">
        {myUsername || 'You'} vs {opponentUsername || 'Opponent'}
      </p>
    </div>
  );
}