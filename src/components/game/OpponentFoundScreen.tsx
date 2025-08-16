"use client";
import Image from 'next/image';

interface OpponentFoundScreenProps {
  myUsername: string | null;
  opponentUsername: string | null;
}

export function OpponentFoundScreen({ myUsername, opponentUsername }: OpponentFoundScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4">
      <Image
        alt=''
        src="https://s3dux5rwcu.ufs.sh/f/3pYCTPyYdTmWkCroS4xNpESWBGz9gjT1xRYHtIreZaJA3Mu7"
        layout='fill'
        objectFit='cover'
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          filter: 'brightness(0.5)',
        }}
      />
      <h2 className="text-3xl font-medium text-green-600 z-10">Opponent found!</h2>
      <p className="text-2xl mt-2 text-white z-10">
        {myUsername || 'You'} vs {opponentUsername || 'Opponent'}
      </p>
    </div>
  );
}