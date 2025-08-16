import React from 'react';

interface LoadingScreenProps {
  connectionMessage: string;
  progress: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ connectionMessage, progress }) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full"
    >
      <div className="text-center text-white">
        <p className="text-lg font-semibold mb-4">Loading...</p>
        <div className="w-64 bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm">{connectionMessage}</p>
      </div>
    </div>
  );
};
