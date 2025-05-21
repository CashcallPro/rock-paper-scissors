"use client";
import Head from 'next/head';
import { Button } from 'primereact/button'; // For Exit Game button

import { useScreenHeight } from '../hooks/useScreenHeight';
import { useGameLogic } from '../hooks/useGameLogic';

import { StartScreen } from '../components/game/StartScreen';
import { SearchingScreen } from '../components/game/SearchingScreen';
import { OpponentFoundScreen } from '../components/game/OpponentFoundScreen';
import { JoiningScreen } from '../components/game/JoiningScreen';
import { PlayingScreen } from '../components/game/PlayingScreen';
import Image from 'next/image';

// Ensure animate-pop is defined in your global CSS if not using a utility for it
// styles/globals.css or equivalent:
// @keyframes pop {
//   0% { transform: scale(1); }
//   50% { transform: scale(1.2); }
//   100% { transform: scale(1); }
// }
// .animate-pop { animation: pop 0.5s ease-in-out; }

export default function GamePage() {
  const screenHeight = useScreenHeight();
  const {
    gamePhase, username, myServerConfirmedUsername, opponentUsername,
    myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
    roundResult, roundReason, winStreak, longestStreak, yourScore, opponentScore,
    socketConnectionMessage, userActionMessage, roundStatusMessage,
    hasMadeChoiceThisRound, isConnected, sessionId,
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    joiningCountdown,
    setUsername, handlePlayerChoice, handleStartGame, handleEndGame,
  } = useGameLogic();


  const renderGameContent = () => {
    switch (gamePhase) {
      case 'start':
        return (
          <StartScreen
            username={username}
            setUsername={setUsername}
            onStartGame={handleStartGame}
            connectionMessage={socketConnectionMessage}
            userActionMessage={userActionMessage}
            longestStreak={longestStreak}
            isConnected={isConnected}
          />
        );
      case 'searching':
        return <SearchingScreen usernameToDisplay={myServerConfirmedUsername || username} />;
      case 'opponentFound':
        return <OpponentFoundScreen myUsername={myServerConfirmedUsername} opponentUsername={opponentUsername} />;
      case 'joining':
        return <JoiningScreen countdown={joiningCountdown} />;
      case 'playing':
        return (
          <PlayingScreen
            myUsername={myServerConfirmedUsername}
            opponentUsername={opponentUsername}
            winStreak={winStreak}
            longestStreak={longestStreak}
            yourScore={yourScore}
            opponentScore={opponentScore}
            isMyTurnTimerActive={isMyTurnTimerActive}
            turnTimerProgress={turnTimerProgress}
            turnTimeRemaining={turnTimeRemaining}
            myChoiceEmoji={myChoiceEmoji}
            myChoiceAnimate={myChoiceAnimate}
            opponentChoiceEmoji={opponentChoiceEmoji}
            opponentChoiceAnimate={opponentChoiceAnimate}
            roundResult={roundResult}
            roundReason={roundReason}
            roundStatusMessage={roundStatusMessage}
            hasMadeChoiceThisRound={hasMadeChoiceThisRound}
            isConnected={isConnected}
            sessionId={sessionId}
            onPlayerChoice={handlePlayerChoice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen overflow-hidden flex flex-col items-center bg-gray-100" style={{ height: screenHeight }}>
      <Head>
        <title>
          {gamePhase === 'playing' && myServerConfirmedUsername && opponentUsername
            ? `RPS: ${myServerConfirmedUsername} vs ${opponentUsername}`
            : 'Rock Paper Scissors - Multiplayer'}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className={`w-full flex flex-col items-center ${gamePhase === 'playing' ? 'justify-between' : 'justify-center flex-grow'}`} style={{ height: screenHeight }}>
        {/* Exit Game button can be part of the main layout or conditional */}
        {gamePhase !== 'start' && ( // Show Exit button only when not in start phase
          <div className='w-full flex justify-start p-4 absolute top-0 left-0'>
            <button
              onClick={handleEndGame}
              disabled={!isConnected} // Apply disabled state to the button wrapper
              className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out
                             ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              <Image
                src="/btn-giveup.svg" // Path relative to the public folder
                alt="Start Game"
                width={90} // Specify a base width (adjust as needed)
                height={40} // Specify a base height (adjust as needed)
                className={`object-contain ${!isConnected ? '' : 'cursor-pointer'}`}
                priority // If it's an LCP element
              />
            </button>
          </div>
        )}
        <div className={`w-full h-full flex flex-col items-center ${gamePhase === 'playing' ? 'justify-between' : 'justify-center'}`}>
          {renderGameContent()}
        </div>
      </div>
    </div>
  );
}