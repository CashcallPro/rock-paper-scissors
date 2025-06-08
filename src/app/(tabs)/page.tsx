import React from 'react';
import Link from 'next/link';

const PlayPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-4xl font-bold mb-8">Play Screen</h1>
      <p className="mb-8">This is where the main interaction for starting a game will be.</p>
      <Link
        href="/game"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-md transition-colors duration-150 ease-in-out"
      >
        Start Game
      </Link>
      {/* Placeholder for other Play tab content */}
    </div>
  );
};

export default PlayPage;
