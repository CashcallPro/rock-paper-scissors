export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type Choice = 'rock' | 'paper' | 'scissors';

export type ServerResult = 'You won!' | 'You lost!' | "It's a tie!" | '';

export type GamePhase = 'start' | 'searching' | 'opponentFound' | 'joining' | 'playing';

export interface MatchFoundData {
  sessionId: string;
  opponent: string;
  yourUsername: string;
}

export interface RoundResultData {
  yourChoice: Choice | null;
  opponentChoice: Choice | null;
  result: ServerResult;
  reason?: string;
  scores: { currentPlayer: number; opponent: number };
}

export interface OpponentMadeChoiceData {
    message: string;
    timerDetails?: { activeFor: string; duration: number }
}