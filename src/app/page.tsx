"use client";
import Head from 'next/head';
import { useScreenHeight } from '../hooks/useScreenHeight';
import { useGame } from '../context/GameContext';
import ShopScreen from '../components/shop/ShopScreen';
import GiftsScreen from '../components/gifts/GiftsScreen';
import RoadmapScreen from '../components/roadmap/RoadmapScreen';
import FriendsScreen from '../components/friends/FriendsScreen';
import QuestsScreen from '../components/quests/QuestsScreen';
import { LoadingScreen } from '../components/game/LoadingScreen';
import { StartScreen } from '../components/game/StartScreen';
import { SearchingScreen } from '../components/game/SearchingScreen';
import { OpponentFoundScreen } from '../components/game/OpponentFoundScreen';
import { JoiningScreen } from '../components/game/JoiningScreen';
import { PlayingScreen } from '../components/game/PlayingScreen';
import { GameEndedScreen } from '../components/game/GameEndedScreen'; // Import GameEndedScreen
import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import { IMAGES } from '@/lib/image-constants';

// Ensure animate-pop is defined in your global CSS if not using a utility for it
// styles/globals.css or equivalent:
// @keyframes pop {
//   0% { transform: scale(1); }
//   50% { transform: scale(1.2); }
//   100% { transform: scale(1); }
// }
// .animate-pop { animation: pop 0.5s ease-in-out; }

function GamePageContent() {
  const screenHeight = useScreenHeight();
  const {
    gamePhase, username, userProfile, myServerConfirmedUsername, opponentUsername,
    myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
    roundResult, roundReason, winStreak, longestStreak, yourScore, opponentScore,
    socketConnectionMessage, userActionMessage, roundStatusMessage,
    hasMadeChoiceThisRound, isConnected, sessionId,
    coinChange,
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    joiningCountdown,
    // New state for game ended phase from useGameLogic
    gameEndReason,
    finalScores,
    canPlayAgain, // Destructure canPlayAgain
    isUsernameFromQuery,
    setUsername, handlePlayerChoice,
    handlePlayerReaction, handleStartGame,
    handleEndGame, resetGameToStart, // Added resetGameToStart
    overlay,
    closeOverlay,
    openShopOverlay,
    openGiftsOverlay,
    openRoadmapOverlay,
    openFriendsOverlay,
    openQuestOverlay,
  } = useGame();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (gamePhase === 'loading') {
      const timer = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 200);

      return () => clearInterval(timer);
    }
  }, [gamePhase]);

  const getBackgroundImage = (gamePhase: string) => {
    switch (gamePhase) {
      case 'loading':
      case 'start':
      case 'playing':
      case 'searching':
      case 'opponentFound':
      case 'joining':
        return IMAGES.GAME_BG;
      default:
        return IMAGES.GAME_BG;
    }
  };

  const renderGameContent = () => {

    switch (gamePhase) {
      case 'loading':
        return <LoadingScreen connectionMessage={socketConnectionMessage} progress={progress} />;
      case 'start':
        console.log(turnTimerDuration)
        return (
          <StartScreen
            username={username}
            setUsername={setUsername}
            onStartGame={handleStartGame}
            connectionMessage={socketConnectionMessage}
            userActionMessage={userActionMessage}
            longestStreak={longestStreak}
            isConnected={isConnected}
            isUsernameFromQuery={isUsernameFromQuery}
            userProfile={userProfile}
            onOpenShop={openShopOverlay}
            onOpenGifts={openGiftsOverlay}
            onOpenRoadmap={openRoadmapOverlay}
            onOpenFriends={openFriendsOverlay}
            onOpenQuest={openQuestOverlay}
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
            coinChange={coinChange}
            roundResult={roundResult}
            roundReason={roundReason}
            roundStatusMessage={roundStatusMessage}
            hasMadeChoiceThisRound={hasMadeChoiceThisRound}
            isConnected={isConnected}
            sessionId={sessionId}
            onPlayerChoice={handlePlayerChoice}
            onReactionClick={handlePlayerReaction}
          />
        );
      case 'gameEnded': // Add case for gameEnded
        return (
          <GameEndedScreen
            reason={gameEndReason}
            playerScore={finalScores.playerScore}
            opponentScore={finalScores.opponentScore}
            onPlayAgain={() => resetGameToStart("Welcome back! Let's play again.")}
            canPlayAgain={canPlayAgain} // Pass canPlayAgain
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-screen overflow-hidden flex flex-col items-center" style={{ height: screenHeight }}>
      <Head>
        <title>
          {gamePhase === 'playing' && myServerConfirmedUsername && opponentUsername
            ? `RPS: ${myServerConfirmedUsername} vs ${opponentUsername}`
            : 'Rock Paper Scissors - Multiplayer'}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {getBackgroundImage(gamePhase) && (
        <Image
          alt="background"
          src={getBackgroundImage(gamePhase)}
          layout="fill"
          objectFit="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            filter: gamePhase === 'start' ? 'brightness(0.8)' : 'none',
          }}
        />
      )}

      <div className={`w-full flex flex-col items-center ${gamePhase === 'playing' ? 'justify-between' : 'justify-center flex-grow'} z-10`} style={{ height: screenHeight }}>
        {/* Exit Game button can be part of the main layout or conditional */}
        {(gamePhase === 'searching' || gamePhase === 'playing') && ( // Show Exit button only when not in start phase
          <div className='w-full flex justify-start p-4 absolute top-0 left-0 z-11'>
            <button
              onClick={handleEndGame}
              disabled={!isConnected} // Apply disabled state to the button wrapper
              className={`relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out
                             ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} z-10 top-15`}
            >
              <Image
                src={IMAGES.GIVE_UP} // Path relative to the public folder
                alt="Give Up"
                width={90} // Specify a base width (adjust as needed)
                height={40} // Specify a base height (adjust as needed)
                className={`object-contain ${!isConnected ? '' : 'cursor-pointer'} z-10`}
                priority // If it's an LCP element
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-white font-bold text-sm pointer-events-none">GIVE UP</span>
              </div>
            </button>
          </div>
        )}
        <div className={`w-full h-full flex flex-col items-center ${gamePhase === 'playing' ? 'justify-between' : 'justify-center'}`}>
          {renderGameContent()}
        </div>
      </div>

      {overlay === 'shop' && (
        <div className="absolute inset-0 z-30">
          <ShopScreen onBack={closeOverlay} />
        </div>
      )}
      {overlay === 'gifts' && (
        <div className="absolute inset-0 z-30">
          <GiftsScreen onBack={closeOverlay} />
        </div>
      )}
      {overlay === 'roadmap' && (
        <div className="absolute inset-0 z-30">
          <RoadmapScreen onBack={closeOverlay} />
        </div>
      )}
      {overlay === 'friends' && (
        <div className="absolute inset-0 z-30">
          <FriendsScreen onBack={closeOverlay} />
        </div>
      )}
      {overlay === 'quest' && (
        <div className="absolute inset-0 z-30">
          <QuestsScreen onBack={closeOverlay} />
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    // Wrap the component that uses useSearchParams (indirectly via useGameLogic)
    // in a Suspense boundary.
    <Suspense fallback={<div>Loading page details...</div>}> {/* Or any loading UI */}
      <GamePageContent />
    </Suspense>
  );
}
