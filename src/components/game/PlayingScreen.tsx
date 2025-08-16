"use client";
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Choice, choiceEmojis, Reaction, reactionEmojis } from '../../lib'; // Adjust path if necessary
import Image from 'next/image';
import PlayingHeader from './PlayingHeader';
import { memo, useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import ReactionsPopup from './ReactionsPopup';

interface PlayerDisplayProps {
  name: string | null;
  emoji: string;
  isOpponent?: boolean;
  animate: boolean;
}

const PlayerChoiceDisplay = ({ name, emoji, isOpponent = false, animate }: PlayerDisplayProps) => (
  <div className="flex flex-col items-center z-10">
    {isOpponent && <span className="text-xs sm:text-sm text-white">{name || 'Opponent'}</span>}
    <div
      className={`text-9xl sm:text-6xl text-white ${isOpponent ? 'transform rotate-180' : ''} ${animate ? 'animate-pop' : ''}`}
    >
      {emoji || '?'}
    </div>
    {!isOpponent && <span className="text-xs sm:text-sm text-white">{name || 'You'}</span>}
  </div>
);


interface PlayingScreenProps {
  myUsername: string | null;
  opponentUsername: string | null;
  winStreak: number;
  longestStreak: number;
  yourScore: number;
  opponentScore?: number;
  coinChange: number;
  isMyTurnTimerActive: boolean;
  turnTimerProgress: number;
  turnTimeRemaining: number;
  myChoiceEmoji: string;
  myChoiceAnimate: boolean;
  opponentChoiceEmoji: string;
  opponentChoiceAnimate: boolean;
  roundResult: string;
  roundReason: string;
  roundStatusMessage: string;
  hasMadeChoiceThisRound: boolean;
  isConnected: boolean;
  sessionId: string | null;
  onPlayerChoice: (choice: Choice) => void;
  onReactionClick: (reaction: Reaction) => void;
}

export const PlayingScreen = memo(function PlayingScreen({
  myUsername, opponentUsername, winStreak, longestStreak, yourScore, opponentScore,
  isMyTurnTimerActive, turnTimerProgress, turnTimeRemaining,
  myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
  roundResult, roundReason, roundStatusMessage,
  hasMadeChoiceThisRound, isConnected, sessionId, onPlayerChoice, onReactionClick,
  coinChange,
}: PlayingScreenProps) {
  const { userProfile, opponentProfile } = useUser();
  const [isReactionsPopupOpen, setIsReactionsPopupOpen] = useState(false);
  const reactionsButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleReactionClick = (reaction: Reaction) => {
    onReactionClick(reaction);
    setIsReactionsPopupOpen(false);
  };

  return (
    <>
      <PlayingHeader
        user={userProfile}
        opponent={opponentProfile}
        userScore={yourScore}
        opponentScore={opponentScore ?? 0}
        userCoins={userProfile?.coins ?? 0}
        coinChange={coinChange}
      />
      {isMyTurnTimerActive && (
        <div className="w-full max-w-md px-4 my-2 z-10">
          <ProgressBar value={turnTimerProgress} showValue={false} style={{ height: '10px' }} />
          <p className="text-center text-sm text-red-500 mt-1">
            Time remaining: {(turnTimeRemaining / 1000).toFixed(1)}s
          </p>
        </div>
      )}

      <div className="flex-grow w-full bg-green-200 flex flex-col items-center justify-center space-y-1 sm:space-y-2 py-1 sm:py-2">

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
          }}
        />

        <div className='z-20 flex-col absolute top-20 right-2'>
          <Button
            ref={reactionsButtonRef}
            onClick={() => setIsReactionsPopupOpen(prev => !prev)}
            className="bg-gray-800 text-white p-2 rounded-full"
          >
            <span className="text-3xl">😀</span>
          </Button>
          <ReactionsPopup
            isOpen={isReactionsPopupOpen}
            onClose={() => setIsReactionsPopupOpen(false)}
            onReactionClick={handleReactionClick}
            buttonRef={reactionsButtonRef}
          />
        </div>

        <div className='bg-blue-500/50 w-full flex flex-col items-center justify-center space-y-1 sm:space-y-2 sm:py-2 z-10 py-4'>
          <PlayerChoiceDisplay
            name={opponentUsername}
            emoji={opponentChoiceEmoji}
            animate={opponentChoiceAnimate}
            isOpponent
          />

          <div className="z-10 text-lg sm:text-xl font-medium h-auto min-h-[24px] text-white sm:min-h-[28px] my-1 sm:my-2 text-center px-2">
            {roundResult ? `${roundResult}${roundReason ? ` (${roundReason})` : ''}` : roundStatusMessage || <> </>}
          </div>

          <PlayerChoiceDisplay
            name={myUsername}
            emoji={myChoiceEmoji}
            animate={myChoiceAnimate}
          />
        </div>
      </div>

      <div className="z-10 flex flex-row sm:flex-row gap-y-2 sm:gap-x-3 pb-5 mb-12 sm:mb-6 px-16 w-full justify-between">
        {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
          <Button
            key={choice}
            label={`${choiceEmojis[choice]}`}
            className="text-4xl sm:text-4xl md:text-4xl whitespace-pre-line bg-blue-400 hover:bg-blue-500 active:bg-blue-600 rounded-lg text-white m-5 p-4 w-16 h-16"
            onClick={() => onPlayerChoice(choice)}
            disabled={hasMadeChoiceThisRound || !isConnected || !sessionId}
          />
        ))}
      </div>
    </>
  );
});