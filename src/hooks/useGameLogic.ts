"use client";
import { useState, useEffect, useCallback } from 'react';
import { Choice, ServerResult, GamePhase, choiceEmojis, MatchFoundData, RoundResultData, OpponentMadeChoiceData, API_URL_BOT_SCORE, SOCKET_SERVER_URL, SessionData, Reaction, TelegramUser, UserProfile } from '../lib';
import { useSocketConnection } from './useSocketConnection';
import { useTurnTimer } from './useTurnTimer';
import { decryptFromUrl, getQueryParam } from '@/lib/decrypt';
import { useUser } from '@/context/UserContext';

// Interface for the new socket event
interface MatchmakingFailedInsufficientCoinsData {
  message: string;
  required: number;
  currentBalance: number;
}

// Interface for the matchmaking_failed_system_error event
interface MatchmakingFailedSystemErrorData {
  message: string;
}

// Interface for the opponent_forfeit_coins event
interface OpponentForfeitCoinsData {
  message: string;
}

// Interface for the forfeit_coins event
interface ForfeitCoinsData {
  message: string;
}

// Interface for the game_ended_insufficient_funds event
interface GameEndedInsufficientFundsData {
  message: string;
  canContinue: boolean;
  session: SessionData;
}

export function useGameLogic() {
  const { telegramUser, userProfile, setUserProfile, username, setUsername, isUsernameFromQuery, setOpponentProfile } = useUser();
  const { socket, isConnected, connectionMessage: socketConnectionMessage, connectSocket } = useSocketConnection(SOCKET_SERVER_URL);
  const {
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    startMyTurnTimer, stopMyTurnTimer, resetMyTurnTimer
  } = useTurnTimer();

  // Player & Opponent visual state
  const [myChoiceEmoji, setMyChoiceEmoji] = useState<string>('?');
  const [myChoiceAnimate, setMyChoiceAnimate] = useState<boolean>(false);
  const [opponentChoiceEmoji, setOpponentChoiceEmoji] = useState<string>('?');
  const [opponentChoiceAnimate, setOpponentChoiceAnimate] = useState<boolean>(false);

  const [coinChange, setCoinChange] = useState<number>(0);
  const [roundResult, setRoundResult] = useState<ServerResult>('');
  const [roundReason, setRoundReason] = useState<string>('');
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [yourScore, setYourScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number | undefined>();

  // Game flow & multiplayer state
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [joiningCountdown, setJoiningCountdown] = useState<number>(2);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [myServerConfirmedUsername, setMyServerConfirmedUsername] = useState<string | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);

  // UI messages and controls
  const [overlay, setOverlay] = useState<'shop' | 'gifts' | null>(null);
  const [userActionMessage, setUserActionMessage] = useState<string>('');
  const [roundStatusMessage, setRoundStatusMessage] = useState<string>('');
  const [hasMadeChoiceThisRound, setHasMadeChoiceThisRound] = useState<boolean>(false);

  // New state for game ended phase
  const [gameEndReason, setGameEndReason] = useState<string>('');
  const [finalScores, setFinalScores] = useState<{ playerScore: number; opponentScore: number | undefined }>({ playerScore: 0, opponentScore: undefined });
  const [canPlayAgain, setCanPlayAgain] = useState<boolean>(true); // New state for canPlayAgain


  // Centralized game reset logic
  const resetGameToStart = useCallback((message?: string) => {
    if (message) {
      setUserActionMessage(message);
    } else {
      setUserActionMessage('');
    }

    // If currently searching, tell the server to cancel matchmaking
    if (gamePhase === 'searching' && socket && isConnected) {
      console.log('Resetting to start from "searching" phase, emitting cancel_matchmaking');
      socket.emit('cancel_matchmaking');
    }

    setGamePhase('start');
    setSessionId(null);
    setOpponentUsername(null);
    setMyServerConfirmedUsername(null);
    setMyChoiceEmoji('?');
    setOpponentChoiceEmoji('?');
    setRoundResult('');
    setRoundReason('');
    setYourScore(0);
    setOpponentScore(undefined);
    setWinStreak(0);
    setHasMadeChoiceThisRound(false);
    setRoundStatusMessage('');
    setJoiningCountdown(2);
    // Reset new game ended state
    setGameEndReason('');
    setFinalScores({ playerScore: 0, opponentScore: undefined });
    setCanPlayAgain(true); // Reset canPlayAgain
    stopMyTurnTimer();
    resetMyTurnTimer();
  }, [
    gamePhase, // Added gamePhase to dependencies
    socket,    // Added socket
    isConnected, // Added isConnected
    setGamePhase, setSessionId, setOpponentUsername, setMyServerConfirmedUsername,
    setMyChoiceEmoji, setOpponentChoiceEmoji, setRoundResult, setRoundReason,
    setYourScore, setOpponentScore, setWinStreak, setHasMadeChoiceThisRound,
    setUserActionMessage, setRoundStatusMessage, setJoiningCountdown,
    // Added setters for new state
    setGameEndReason, setFinalScores, setCanPlayAgain, // Added setCanPlayAgain
    stopMyTurnTimer, resetMyTurnTimer
  ]);


  // This effect runs once when the component mounts.
  useEffect(() => {
    // It checks if the game is in the 'loading' phase and if the socket is connected.
    if (gamePhase === 'loading' && isConnected && telegramUser && userProfile) {
      // If both conditions are true, it transitions the game to the 'start' phase.
      setGamePhase('start');
    }
    // The dependency array [gamePhase, isConnected, setGamePhase] ensures this effect
    // re-runs whenever any of these values change.
  }, [gamePhase, isConnected, telegramUser, userProfile, setGamePhase]);


  // Animation Triggers
  useEffect(() => {
    if (myChoiceAnimate) {
      const timer = setTimeout(() => setMyChoiceAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [myChoiceAnimate]);

  useEffect(() => {
    if (opponentChoiceAnimate) {
      const timer = setTimeout(() => setOpponentChoiceAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [opponentChoiceAnimate]);

  useEffect(() => {
    if (coinChange !== 0) {
      const timer = setTimeout(() => setCoinChange(0), 1000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [coinChange]);

  const handleMatchFound = useCallback((data: MatchFoundData) => {
    console.log('Match found:', data);
    setSessionId(data.sessionId);
    setOpponentUsername(data.opponent);
    setMyServerConfirmedUsername(data.yourUsername);
    setGamePhase('opponentFound');
    setWinStreak(0);
    setLongestStreak(0);
    setYourScore(0);
    setOpponentScore(0);
    setRoundStatusMessage('');
    setUserActionMessage('');
    setHasMadeChoiceThisRound(false);
    resetMyTurnTimer();

    if (data.opponent) {
      fetch(`${SOCKET_SERVER_URL}/users/${data.opponent}`)
        .then(res => res.json())
        .then(profile => {
          if (profile) {
            setOpponentProfile(profile);
          }
        })
        .catch(error => console.error('Failed to fetch opponent profile:', error));
    }
  }, [setOpponentProfile, resetMyTurnTimer]);

  const handleWaiting = useCallback((data: { message: string }) => {
    setRoundStatusMessage(data.message);
  }, []);

  const handleAlreadyInQueue = useCallback((data: { message: string }) => {
    resetGameToStart(data.message);
  }, [resetGameToStart]);

  const handleAlreadyInSession = useCallback((data: { message: string }) => {
    console.log('Already in session event:', data);
    resetGameToStart(data.message);
  }, [resetGameToStart]);

  const handleMatchmakingCancelled = useCallback((data: { message: string }) => {
    console.log('Matchmaking cancelled by server:', data.message);
    if (gamePhase !== 'start') {
      setGamePhase('start');
    }
    setUserActionMessage(data.message || 'Matchmaking cancelled.');
    setRoundStatusMessage('');
  }, [gamePhase]);

  const handleNotInQueue = useCallback((data: { message: string }) => {
    console.log('Not in queue (or already matched) according to server:', data.message);
    setUserActionMessage(data.message);
  }, []);

  const handleCannotCancelInGame = useCallback((data: { message: string }) => {
    console.warn('Attempted to cancel matchmaking while in game:', data.message);
    setUserActionMessage(data.message);
  }, []);

  const handleChoiceRegistered = useCallback((data: { message: string }) => {
    console.log(data.message);
    setRoundStatusMessage(data.message || 'Choice registered. Waiting for opponent.');
  }, []);

  const handleOpponentMadeChoice = useCallback((data: OpponentMadeChoiceData) => {
    console.log('Opponent made choice:', data);
    setRoundStatusMessage(data.message);

    if (socket && data.timerDetails && data.timerDetails.activeFor === socket.id && !hasMadeChoiceThisRound) {
      startMyTurnTimer(data.timerDetails.duration);
    } else if (hasMadeChoiceThisRound) {
      setRoundStatusMessage('Opponent has chosen. Revealing results...');
      stopMyTurnTimer();
    }
  }, [socket, hasMadeChoiceThisRound, startMyTurnTimer, stopMyTurnTimer]);

  const handleRoundResult = useCallback((data: RoundResultData) => {
    console.log('Round Result:', data);
    setMyChoiceEmoji(data.yourChoice ? choiceEmojis[data.yourChoice] : '⏳');
    setMyChoiceAnimate(true);
    setOpponentChoiceEmoji(data.opponentChoice ? choiceEmojis[data.opponentChoice] : '⏳');
    setOpponentChoiceAnimate(true);
    setRoundResult(data.result);
    setRoundReason(data.reason || '');
    setYourScore(data.scores.currentPlayer);
    setOpponentScore(data.scores.opponent);

    let change = 0;
    if (data.result.includes("won")) {
      change = 8;
      setWinStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > longestStreak) setLongestStreak(newStreak);
        return newStreak;
      });
    } else if (data.result.includes("lost")) {
      change = -10;
      setWinStreak(0);
    }
    setCoinChange(change);

    if (userProfile) {
      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, coins: prevProfile.coins + change };
      });
    }

    setHasMadeChoiceThisRound(false);
    setRoundStatusMessage(data.reason || 'Choose your next move!');
    stopMyTurnTimer();
  }, [longestStreak, userProfile, setUserProfile, stopMyTurnTimer]);

  const handleOpponentDisconnected = useCallback((data: { message: string }) => {
    console.log('Opponent disconnected:', data);
    setGamePhase('gameEnded');
    setGameEndReason(data.message || "Opponent disconnected. The game has ended.");
    setFinalScores({ playerScore: yourScore, opponentScore: opponentScore });
    stopMyTurnTimer();
    resetMyTurnTimer();
  }, [yourScore, opponentScore, stopMyTurnTimer, resetMyTurnTimer]);

  const handleGameEndedByServer = useCallback((data: { message: string; initiator?: string }) => {
    console.log('Game ended by server/opponent:', data);
    const endMessage = data.initiator ? `${data.initiator} ended the game.` : (data.message || "The game has ended.");
    setGamePhase('gameEnded');
    setGameEndReason(endMessage);
    setFinalScores({ playerScore: yourScore, opponentScore: opponentScore });
    stopMyTurnTimer();
    resetMyTurnTimer();
  }, [yourScore, opponentScore, stopMyTurnTimer, resetMyTurnTimer]);

  const handleErrorOccurred = useCallback((data: { message: string }) => {
    setUserActionMessage(`Error: ${data.message}`);
    console.error('Error from server:', data.message);
    stopMyTurnTimer();
  }, [stopMyTurnTimer]);

  const handleMatchmakingFailedInsufficientCoins = useCallback((data: MatchmakingFailedInsufficientCoinsData) => {
    console.log('Matchmaking failed due to insufficient coins:', data);
    resetGameToStart(data.message);
  }, [resetGameToStart]);

  const handleMatchmakingFailedSystemError = useCallback((data: MatchmakingFailedSystemErrorData) => {
    console.log('Matchmaking failed due to system error:', data);
    resetGameToStart(data.message);
  }, [resetGameToStart]);

  const handleOpponentForfeitCoins = useCallback((data: OpponentForfeitCoinsData) => {
    console.log('Opponent forfeit coins:', data);
    setRoundStatusMessage(data.message);
  }, []);

  const handleForfeitCoins = useCallback((data: ForfeitCoinsData) => {
    console.log('Player forfeit coins:', data);
    setRoundStatusMessage(data.message);
  }, []);

  const handleGameEndedInsufficientFunds = useCallback((data: GameEndedInsufficientFundsData) => {
    console.log('Game ended due to insufficient funds:', data);
    setGamePhase('gameEnded');
    setGameEndReason(data.message);

    const myPlayerId = socket?.id;
    let myFinalScore = 0;
    let opponentFinalScore: number | undefined = undefined;

    if (myPlayerId && data.session.scores) {
      myFinalScore = data.session.scores[myPlayerId] ?? 0;
      const opponentPlayer = data.session.players.find(p => p.socketId !== myPlayerId);
      if (opponentPlayer && data.session.scores[opponentPlayer.socketId] !== undefined) {
        opponentFinalScore = data.session.scores[opponentPlayer.socketId];
      } else if (opponentPlayer) {
        opponentFinalScore = opponentScore;
      }
    } else {
      myFinalScore = yourScore;
      opponentFinalScore = opponentScore;
    }

    setFinalScores({ playerScore: myFinalScore, opponentScore: opponentFinalScore });
    setCanPlayAgain(data.canContinue);
    stopMyTurnTimer();
    resetMyTurnTimer();
  }, [socket, yourScore, opponentScore, stopMyTurnTimer, resetMyTurnTimer]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('match_found', handleMatchFound);
    socket.on('waiting_for_opponent', handleWaiting);
    socket.on('already_in_queue', handleAlreadyInQueue);
    socket.on('already_in_session', handleAlreadyInSession);
    socket.on('matchmaking_cancelled', handleMatchmakingCancelled);
    socket.on('not_in_queue', handleNotInQueue);
    socket.on('cannot_cancel_in_game', handleCannotCancelInGame);
    socket.on('choice_registered', handleChoiceRegistered);
    socket.on('opponent_made_choice', handleOpponentMadeChoice);
    socket.on('round_result', handleRoundResult);
    socket.on('opponent_disconnected', handleOpponentDisconnected);
    socket.on('game_ended', handleGameEndedByServer);
    socket.on('error_occurred', handleErrorOccurred);
    socket.on('matchmaking_failed_insufficient_coins', handleMatchmakingFailedInsufficientCoins);
    socket.on('matchmaking_failed_system_error', handleMatchmakingFailedSystemError);
    socket.on('opponent_forfeit_coins', handleOpponentForfeitCoins);
    socket.on('forfeit_coins', handleForfeitCoins);
    socket.on('game_ended_insufficient_funds', handleGameEndedInsufficientFunds);

    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('waiting_for_opponent', handleWaiting);
      socket.off('already_in_queue', handleAlreadyInQueue);
      socket.off('already_in_session', handleAlreadyInSession);
      socket.off('matchmaking_cancelled', handleMatchmakingCancelled);
      socket.off('not_in_queue', handleNotInQueue);
      socket.off('cannot_cancel_in_game', handleCannotCancelInGame);
      socket.off('choice_registered', handleChoiceRegistered);
      socket.off('opponent_made_choice', handleOpponentMadeChoice);
      socket.off('round_result', handleRoundResult);
      socket.off('opponent_disconnected', handleOpponentDisconnected);
      socket.off('game_ended', handleGameEndedByServer);
      socket.off('error_occurred', handleErrorOccurred);
      socket.off('matchmaking_failed_insufficient_coins', handleMatchmakingFailedInsufficientCoins);
      socket.off('matchmaking_failed_system_error', handleMatchmakingFailedSystemError);
      socket.off('opponent_forfeit_coins', handleOpponentForfeitCoins);
      socket.off('forfeit_coins', handleForfeitCoins);
      socket.off('game_ended_insufficient_funds', handleGameEndedInsufficientFunds);
    };
  }, [
    socket, handleMatchFound, handleWaiting, handleAlreadyInQueue, handleAlreadyInSession,
    handleMatchmakingCancelled, handleNotInQueue, handleCannotCancelInGame, handleChoiceRegistered,
    handleOpponentMadeChoice, handleRoundResult, handleOpponentDisconnected, handleGameEndedByServer,
    handleErrorOccurred, handleMatchmakingFailedInsufficientCoins, handleMatchmakingFailedSystemError,
    handleOpponentForfeitCoins, handleForfeitCoins, handleGameEndedInsufficientFunds
  ]);

  // Game Phase Transitions (no changes here)
  useEffect(() => {
    if (gamePhase === 'opponentFound') {
      const timer = setTimeout(() => {
        setJoiningCountdown(2);
        setGamePhase('joining');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'joining') {
      if (joiningCountdown > 0) {
        const timer = setTimeout(() => setJoiningCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setMyChoiceEmoji('?');
        setOpponentChoiceEmoji('?');
        setRoundResult('');
        setRoundReason('');
        setGamePhase('playing');
        setHasMadeChoiceThisRound(false);
        setRoundStatusMessage('Game started! Make your move.');
        resetMyTurnTimer();
      }
    }
  }, [gamePhase, joiningCountdown, resetMyTurnTimer]);

  // Actions
  const handlePlayerChoice = useCallback((choice: Choice): void => {
    if (!socket || !sessionId || hasMadeChoiceThisRound || !isConnected) return;

    setMyChoiceEmoji(choiceEmojis[choice]);
    setMyChoiceAnimate(true);
    setOpponentChoiceEmoji('?');
    setRoundResult('');
    setRoundReason('');

    socket.emit('make_choice', { sessionId, choice });
    setHasMadeChoiceThisRound(true);
    setRoundStatusMessage('Choice locked! Waiting for opponent...');
    stopMyTurnTimer();
  }, [socket, sessionId, hasMadeChoiceThisRound, isConnected, stopMyTurnTimer]);

  const handlePlayerReaction = useCallback((reaction: Reaction) => {
    if (!socket || !sessionId || !isConnected) return;

    socket.emit('make_reaction', { sessionId, reaction });
  }, [socket, sessionId, isConnected]);

  const handleStartGame = useCallback(() => {
    if (!telegramUser) {
      setUserActionMessage("User data is not loaded yet. Please wait.");
      return;
    }

    const finalUsername = telegramUser.username || username.trim();

    if (!finalUsername) {
      setUserActionMessage("Please enter a username.");
      return;
    }

    if (socket && isConnected) {
      socket.emit('start', {
        username: finalUsername,
        userId: telegramUser.id,
        groupOwner: undefined // Or handle this from query if needed
      });
      if (!telegramUser.username) setUsername(finalUsername);
      setUserActionMessage('');
      setGamePhase('searching');
      setRoundStatusMessage('Searching for an opponent...');
    } else {
      setUserActionMessage("Cannot connect to server. Please wait or check server status.");
      if (socket && !isConnected) connectSocket();
    }
  }, [socket, isConnected, username, telegramUser, connectSocket]);

  // Explicit function to cancel search, if needed for a specific button
  // This essentially does what resetGameToStart would do if called from 'searching'
  const handleCancelSearch = useCallback(() => {
    if (gamePhase === 'searching' && socket && isConnected) {
      console.log('Explicitly cancelling search.');
      socket.emit('cancel_matchmaking');
      // The server's 'matchmaking_cancelled' event will trigger further UI updates
      // For immediate feedback, you could also do:
      // setGamePhase('start');
      // setUserActionMessage('Matchmaking cancelled.');
      // setRoundStatusMessage('');
    } else if (gamePhase !== 'searching') {
      setUserActionMessage("You are not currently searching for a game.");
    } else {
      setUserActionMessage("Not connected to server.");
    }
    // For now, let's rely on resetGameToStart or the server response
    // to fully transition. If you call resetGameToStart from a "cancel search" button,
    // it will handle the emission and UI reset.
  }, [gamePhase, socket, isConnected]);


  const openShopOverlay = useCallback(() => {
    setOverlay('shop');
  }, []);

  const openGiftsOverlay = useCallback(() => {
    setOverlay('gifts');
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  const handleEndGame = useCallback(async () => {
    if (socket && sessionId && isConnected) {
      socket.emit('end_game', { sessionId });
      console.log('Sent "end_game" event to server for session:', sessionId);
    }

    // const query = window.location.search
    const decryptedQuery = undefined//decryptFromUrl(query)
    const userId = 212307244 //getQueryParam(decryptedQuery, 'userId')
    const inlineMessageId = undefined//getQueryParam(decryptedQuery, 'inlineMessageId')

    if (userId && (yourScore > 0 || longestStreak > 0)) {
      const scoreData = {
        clientInlineMessageId: inlineMessageId,
        userId: userId,
        score: yourScore,
      };
      try {
        await fetch(API_URL_BOT_SCORE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scoreData),
        });
        console.log('Score submitted:', scoreData);
      } catch (err) {
        console.error('Error submitting score:', err);
      }
    }
    // Instead of resetting, transition to gameEnded phase
    setGamePhase('gameEnded');
    setGameEndReason("You ended the game. Play again?");
    setFinalScores({ playerScore: yourScore, opponentScore: opponentScore });
    stopMyTurnTimer();
    resetMyTurnTimer();
    // resetGameToStart("You ended the game. Play again?"); // Original line - removed
  }, [
    socket, sessionId, isConnected, yourScore, longestStreak, opponentScore, // Added opponentScore
    setGamePhase, setGameEndReason, setFinalScores,      // Added state setters
    stopMyTurnTimer, resetMyTurnTimer                                       // Added timer controls
    // resetGameToStart was removed from dependencies as it's no longer called directly
  ]);


  return {
    // State
    gamePhase, username, telegramUser, userProfile, myServerConfirmedUsername, opponentUsername,
    myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
    roundResult, roundReason, winStreak, longestStreak, yourScore, opponentScore,
    socketConnectionMessage, userActionMessage, roundStatusMessage,
    hasMadeChoiceThisRound, isConnected, sessionId,
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    isUsernameFromQuery,
    joiningCountdown,
    // New state for game ended phase
    gameEndReason,
    finalScores,
    canPlayAgain, // Return canPlayAgain
    coinChange,
    // Actions
    setUsername,
    handlePlayerChoice,
    handlePlayerReaction,
    handleStartGame,
    handleEndGame,
    handleCancelSearch, // Exposed if you want a direct cancel button
    resetGameToStart,   // Exposed if you want to call it directly for "go back"
    overlay,
    openShopOverlay,
    openGiftsOverlay,
    closeOverlay,
  };
}