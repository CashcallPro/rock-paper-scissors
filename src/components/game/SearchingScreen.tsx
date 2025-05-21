"use client";
import { ProgressSpinner } from 'primereact/progressspinner';

interface SearchingScreenProps {
  usernameToDisplay: string | null; // Could be from input or server confirmed
}

export function SearchingScreen({ usernameToDisplay }: SearchingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4"
      style={{ backgroundImage: "url('/start-bg.png')" }}>
      {usernameToDisplay && <p className="mt-4 text-white bold">{usernameToDisplay} are you ready to rock?</p>}
      <h2 className="text-3xl font-medium mb-4" style={{ color: 'white' }}>Looking for opponents...</h2>
      <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
    </div>
  );
}