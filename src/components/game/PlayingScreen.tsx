"use client";
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Choice, choiceEmojis, Reaction, reactionEmojis } from '../../lib'; // Adjust path if necessary
import Image from 'next/image';
import PlayingHeader from './PlayingHeader';
import { memo } from 'react';
import { useUser } from '../../context/UserContext';

interface PlayerDisplayProps {
  name: string | null;
  emoji: string;
  isOpponent?: boolean;
  animate: boolean;
}

const PlayerChoiceDisplay = ({ name, emoji, isOpponent = false, animate }: PlayerDisplayProps) => (
  <div className="flex flex-col items-center z-10">
    {isOpponent && <span className="text-xs sm:text-sm text-white-500">{name || 'Opponent'}</span>}
    <div
      className={`text-9xl sm:text-6xl ${isOpponent ? 'transform rotate-180' : ''} ${animate ? 'animate-pop' : ''}`}
    >
      {emoji || '?'}
    </div>
    {!isOpponent && <span className="text-xs sm:text-sm text-white-500">{name || 'You'}</span>}
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
          src="/game-bg.jpg"
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

        <PlayerChoiceDisplay
          name={opponentUsername}
          emoji={opponentChoiceEmoji}
          animate={opponentChoiceAnimate}
          isOpponent
        />

        <div className='z-10 flex-col absolute left-5'>
          {(Object.keys(reactionEmojis)).map(reaction => {
            return (
              <div className='w-10 h-10 items-center justify-center'>
                <Button
                  key={reaction}
                  onClick={() => onReactionClick(reaction as Reaction)}
                >
                  <span className="text-3xl">{reactionEmojis[reaction]}</span>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="z-10 text-lg sm:text-xl font-medium h-auto min-h-[24px] text-white sm:min-h-[28px] my-1 sm:my-2 text-center px-2">
          {roundResult ? `${roundResult}${roundReason ? ` (${roundReason})` : ''}` : roundStatusMessage || <> </>}
        </div>

        <PlayerChoiceDisplay
          name={myUsername}
          emoji={myChoiceEmoji}
          animate={myChoiceAnimate}
        />
      </div>

      <div className="z-10 flex flex-row sm:flex-row gap-y-2 sm:gap-x-3 pb-5 sm:mb-6 px-4 w-full">
        {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
          <Button
            key={choice}
            label={`${choice.charAt(0).toUpperCase() + choice.slice(1)}\n${choiceEmojis[choice]}`}
            className="text-lg sm:text-lg md:text-xl py-2 sm:py-3 px-5 sm:px-4 flex-1 whitespace-pre-line bg-blue-400 hover:bg-blue-500 active:bg-blue-600 rounded-lg text-white" // Added whitespace-pre-line for \n
            onClick={() => onPlayerChoice(choice)}
            disabled={hasMadeChoiceThisRound || !isConnected || !sessionId}
          />
        ))}
      </div>
    </>
  );
});