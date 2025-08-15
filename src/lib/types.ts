export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type Reaction = 'shit' | 'fire' | 'laugh' | 'silence'

export type Choice = 'rock' | 'paper' | 'scissors';

export type ServerResult = 'You won!' | 'You lost!' | "It's a tie!" | '';

export type GamePhase = 'loading' | 'start' | 'searching' | 'opponentFound' | 'joining' | 'playing' | 'gameEnded' | 'shop' | 'gifts';

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

/**
 * Represents a single score entry for a player in a match.
 */
export interface ScoreEntry {
  readonly username: string; // The username of the player this score belongs to
  score: number;          // The score achieved by the player
}

/**
 * Represents a single match played.
 */
export interface Match {
  readonly sessionId: string;   // Unique identifier for the match session
  readonly players: string[];   // Array of usernames of players who participated
  scores: ScoreEntry[];        // Array of score entries for the match
  readonly createdAt: string;   // ISO date string of when the match was created/recorded
  updatedAt: string;           // ISO date string of when the match was last updated
}

/**
 * Represents the main user profile structure.
 */
export interface UserProfile {
  readonly _id: string;        // Unique identifier for the user (e.g., MongoDB ObjectId)
  username: string;           // The user's username
  tickets: number;            // The number of tickets the user has
  photo_url?: string;         // The URL of the user's profile picture
  coins: number;              // The number of coins the user has
  readonly createdAt: string;  // ISO date string of when the user profile was created
  updatedAt: string;          // ISO date string of when the user profile was last updated
  readonly __v: number;       // Version key (common in Mongoose schemas)
  matches: Match[];           // Array of matches the user has participated in
}

// Added based on game_ended_insufficient_funds event requirements
export interface Player {
  socketId: string;
  username: string;
}

export interface Score {
  [playerId: string]: number;
}

export interface SessionData {
  players: Player[];
  startTime: number;
  choices: { [socketId: string]: Choice | null };
  lastActivity: number;
  scores: Score;
  isBotGame?: boolean;
}