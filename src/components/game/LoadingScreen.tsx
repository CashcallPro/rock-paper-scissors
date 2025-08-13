import React from 'react';

// Define the props for the LoadingScreen component
interface LoadingScreenProps {
  connectionMessage: string;
}

// The LoadingScreen component displays a loading message and a spinner
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ connectionMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Container for the spinner and text */}
      <div className="text-center">
        {/* Spinner element */}
        <div className="w-12 h-12 rounded-full animate-spin
          border-4 border-solid border-blue-500 border-t-transparent mb-4"></div>
        {/* Loading text */}
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
        {/* Connection status message */}
        <p className="text-sm text-gray-500">{connectionMessage}</p>
      </div>
    </div>
  );
};
