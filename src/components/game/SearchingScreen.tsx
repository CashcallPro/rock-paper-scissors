"use client";
import { ProgressSpinner } from 'primereact/progressspinner';
import Image from 'next/image';

interface SearchingScreenProps {
  usernameToDisplay: string | null; // Could be from input or server confirmed
}

export function SearchingScreen({ usernameToDisplay }: SearchingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4">
      <Image
        alt=''
        src="/start-bg.png"
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
      {usernameToDisplay && <p className="mt-4 text-white bold z-10">{usernameToDisplay} are you ready to rock?</p>}
      <h2 className="text-3xl font-medium mb-4 z-10" style={{ color: 'white' }}>Looking for opponents...</h2>
      <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
    </div>
  );
}