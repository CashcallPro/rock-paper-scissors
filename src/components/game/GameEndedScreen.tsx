import React from 'react';

interface GameEndedScreenProps {
  reason: string;
  playerScore: number;
  opponentScore: number | undefined;
  onPlayAgain: () => void;
  canPlayAgain: boolean; // Added canPlayAgain prop
}

export const GameEndedScreen: React.FC<GameEndedScreenProps> = ({
  reason,
  playerScore,
  opponentScore,
  onPlayAgain,
  canPlayAgain, // Destructure canPlayAgain
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white p-4">
      <div className="bg-gray-700/70 shadow-xl rounded-lg p-6 md:p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6 text-yellow-400">Game Over</h1>

        <p className="text-xl mb-4 text-gray-300">{reason}</p>

        <div className="my-6 text-lg space-y-2">
          <p>
            Your Score: <span className="font-semibold text-green-400">{playerScore}</span>
          </p>
          <p>
            Opponent Score: <span className="font-semibold text-red-400">{opponentScore !== undefined ? opponentScore : '-'}</span>
          </p>
        </div>

        <div className="my-6 p-3 bg-gray-600 rounded-md">
          <p className="text-sm text-gray-400 italic">
            Total coins earned/lost will be displayed here.
          </p>
        </div>

        <button
          onClick={onPlayAgain}
          disabled={!canPlayAgain} // Use canPlayAgain to disable button
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
