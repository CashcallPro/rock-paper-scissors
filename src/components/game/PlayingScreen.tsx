"use client";
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Choice, choiceEmojis } from '../../lib'; // Adjust path if necessary

interface PlayerDisplayProps {
  name: string | null;
  emoji: string;
  isOpponent?: boolean;
  animate: boolean;
}

const PlayerChoiceDisplay = ({ name, emoji, isOpponent = false, animate }: PlayerDisplayProps) => (
  <div className="flex flex-col items-center">
    {isOpponent && <span className="text-xs sm:text-sm text-gray-500">{name || 'Opponent'}</span>}
    <div
      className={`text-9xl sm:text-6xl ${isOpponent ? 'transform rotate-180' : ''} ${animate ? 'animate-pop' : ''}`}
    >
      {emoji || '?'}
    </div>
    {!isOpponent && <span className="text-xs sm:text-sm text-gray-500">{name || 'You'}</span>}
  </div>
);


interface PlayingScreenProps {
  myUsername: string | null;
  opponentUsername: string | null;
  winStreak: number;
  longestStreak: number;
  yourScore: number;
  opponentScore?: number;
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
}

export function PlayingScreen({
  myUsername, opponentUsername, winStreak, longestStreak, yourScore, opponentScore,
  isMyTurnTimerActive, turnTimerProgress, turnTimeRemaining,
  myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
  roundResult, roundReason, roundStatusMessage,
  hasMadeChoiceThisRound, isConnected, sessionId, onPlayerChoice
}: PlayingScreenProps) {
  return (
    <>
      <div className="w-full flex flex-col items-center py-4" style={{ backgroundColor: '#861886' }}>
        <h1 className="text-3xl sm:text-2xl font-bold mb-1 pt-4 md:pt-2 mt-8 text-center px-2 text-white">
          {myUsername || 'You'} vs {opponentUsername || 'Opponent'}
        </h1>
        <div className=" flex flex-row space-x-4 md:space-x-6 text-base sm:text-lg md:text-xl font-medium mb-2 text-center">
          <div className='text-red'>Win Streak: {winStreak}</div>
          <div>Longest Streak: {longestStreak}</div>
        </div>
        <div className="flex flex-row space-x-4 md:space-x-6 text-base sm:text-lg md:text-xl font-medium mb-2 text-center">
          <div>Your Score: {yourScore}</div>
          <div>Opponent Score: {opponentScore ?? '-'}</div>
        </div>
      </div>

      {isMyTurnTimerActive && (
        <div className="w-full max-w-md px-4 my-2">
          <ProgressBar value={turnTimerProgress} showValue={false} style={{ height: '10px' }} />
          <p className="text-center text-sm text-red-500 mt-1">
            Time remaining: {(turnTimeRemaining / 1000).toFixed(1)}s
          </p>
        </div>
      )}

      <div className="flex-grow w-full bg-green-200 flex flex-col items-center justify-center space-y-1 sm:space-y-2 py-1 sm:py-2">
        <PlayerChoiceDisplay
          name={opponentUsername}
          emoji={opponentChoiceEmoji}
          animate={opponentChoiceAnimate}
          isOpponent
        />

        <div className="text-lg sm:text-xl font-medium h-auto min-h-[24px] text-white sm:min-h-[28px] my-1 sm:my-2 text-center px-2">
          {roundResult ? `${roundResult}${roundReason ? ` (${roundReason})` : ''}` : roundStatusMessage || <> </>}
        </div>

        <PlayerChoiceDisplay
          name={myUsername}
          emoji={myChoiceEmoji}
          animate={myChoiceAnimate}
        />
      </div>

      <div className="flex flex-row sm:flex-row gap-y-2 sm:gap-x-3 mb-4 sm:mb-6 px-4 w-full" style={{ backgroundColor: '#861886' }}>
        {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
          <Button
            key={choice}
            style={{ color: 'white' }}
            label={`${choice.charAt(0).toUpperCase() + choice.slice(1)}\n${choiceEmojis[choice]}`}
            className="p-button-rounded text-lg sm:text-lg md:text-xl py-2 sm:py-3 px-5 sm:px-4 flex-1 whitespace-pre-line" // Added whitespace-pre-line for \n
            onClick={() => onPlayerChoice(choice)}
            disabled={hasMadeChoiceThisRound || !isConnected || !sessionId}
          />
        ))}
      </div>
    </>
  );
}