"use client";
import { useState, useEffect, useCallback } from 'react';
import { Choice, ServerResult, GamePhase, choiceEmojis, MatchFoundData, RoundResultData, OpponentMadeChoiceData, API_URL_BOT_SCORE, SOCKET_SERVER_URL, SessionData } from '../lib';
import { useSocketConnection } from './useSocketConnection';
import { useTurnTimer } from './useTurnTimer';
import { decryptFromUrl, getQueryParam } from '@/lib/decrypt';

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

  const [roundResult, setRoundResult] = useState<ServerResult>('');
  const [roundReason, setRoundReason] = useState<string>('');
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [yourScore, setYourScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number | undefined>();

  // Game flow & multiplayer state
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [joiningCountdown, setJoiningCountdown] = useState<number>(2);
  const [username, setUsername] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [myServerConfirmedUsername, setMyServerConfirmedUsername] = useState<string | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);

  // UI messages and controls
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

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: MatchFoundData) => {
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
    };

    const handleWaiting = (data: { message: string }) => {
      setRoundStatusMessage(data.message);
    };

    const handleAlreadyInQueue = (data: { message: string }) => {
      resetGameToStart(data.message);
    };

    const handleAlreadyInSession = (data: { message: string }) => {
      console.log('Already in session event:', data);
      resetGameToStart(data.message);
    };

    const handleMatchmakingCancelled = (data: { message: string }) => {
      console.log('Matchmaking cancelled by server:', data.message);
      // The resetGameToStart function (if called by user action) would have already
      // set the gamePhase to 'start'. This event confirms it from server.
      // We might just want to show the message.
      // If resetGameToStart wasn't called (e.g. server cancelled for other reason)
      // then we should ensure phase is 'start'.
      if (gamePhase !== 'start') {
        setGamePhase('start'); // Ensure we are at start phase
      }
      setUserActionMessage(data.message || 'Matchmaking cancelled.');
      setRoundStatusMessage(''); // Clear searching message
    };

    const handleNotInQueue = (data: { message: string }) => {
      console.log('Not in queue (or already matched) according to server:', data.message);
      // This might happen if client thought it was searching but server disagrees.
      // Generally, resetGameToStart would handle the client state.
      // This message can be displayed.
      setUserActionMessage(data.message);
    };

    const handleCannotCancelInGame = (data: { message: string }) => {
      console.warn('Attempted to cancel matchmaking while in game:', data.message);
      setUserActionMessage(data.message); // Inform user
      // No phase change needed, user is still in game.
    };

    const handleChoiceRegistered = (data: { message: string }) => {
      console.log(data.message);
      setRoundStatusMessage(data.message || 'Choice registered. Waiting for opponent.');
    };

    const handleOpponentMadeChoice = (data: OpponentMadeChoiceData) => {
      console.log('Opponent made choice:', data);
      setRoundStatusMessage(data.message);

      if (data.timerDetails && data.timerDetails.activeFor === socket.id && !hasMadeChoiceThisRound) {
        startMyTurnTimer(data.timerDetails.duration);
      } else if (hasMadeChoiceThisRound) {
        setRoundStatusMessage('Opponent has chosen. Revealing results...');
        stopMyTurnTimer();
      }
    };

    const handleRoundResult = (data: RoundResultData) => {
      console.log('Round Result:', data);
      setMyChoiceEmoji(data.yourChoice ? choiceEmojis[data.yourChoice] : '⏳');
      setMyChoiceAnimate(true);
      setOpponentChoiceEmoji(data.opponentChoice ? choiceEmojis[data.opponentChoice] : '⏳');
      setOpponentChoiceAnimate(true);
      setRoundResult(data.result);
      setRoundReason(data.reason || '');
      setYourScore(data.scores.currentPlayer);
      setOpponentScore(data.scores.opponent);

      if (data.result === "You won!") {
        setWinStreak((prev) => {
          const newStreak = prev + 1;
          if (newStreak > longestStreak) setLongestStreak(newStreak);
          return newStreak;
        });
      } else if (data.result === "You lost!") {
        setWinStreak(0);
      }

      setHasMadeChoiceThisRound(false);
      setRoundStatusMessage(data.reason || 'Choose your next move!');
      stopMyTurnTimer();
    };

    const handleOpponentDisconnected = (data: { message: string }) => {
      console.log('Opponent disconnected:', data);
      setGamePhase('gameEnded');
      setGameEndReason(data.message || "Opponent disconnected. The game has ended.");
      setFinalScores({ playerScore: yourScore, opponentScore: opponentScore });
      stopMyTurnTimer();
      resetMyTurnTimer();
      // No call to resetGameToStart here, stays in gameEnded phase
    };

    const handleGameEndedByServer = (data: { message: string; initiator?: string }) => {
      console.log('Game ended by server/opponent:', data);
      const endMessage = data.initiator ? `${data.initiator} ended the game.` : (data.message || "The game has ended.");
      setGamePhase('gameEnded');
      setGameEndReason(endMessage);
      setFinalScores({ playerScore: yourScore, opponentScore: opponentScore });
      stopMyTurnTimer();
      resetMyTurnTimer();
      // No call to resetGameToStart here, stays in gameEnded phase
    };

    const handleErrorOccurred = (data: { message: string }) => {
      setUserActionMessage(`Error: ${data.message}`);
      console.error('Error from server:', data.message);
      stopMyTurnTimer();
    };

    const handleMatchmakingFailedInsufficientCoins = (data: MatchmakingFailedInsufficientCoinsData) => {
      console.log('Matchmaking failed due to insufficient coins:', data);
      resetGameToStart(data.message);
    };

    const handleMatchmakingFailedSystemError = (data: MatchmakingFailedSystemErrorData) => {
      console.log('Matchmaking failed due to system error:', data);
      resetGameToStart(data.message);
    };

    const handleOpponentForfeitCoins = (data: OpponentForfeitCoinsData) => {
      console.log('Opponent forfeit coins:', data);
      setRoundStatusMessage(data.message);
      // Do not change gamePhase or reset game here
    };

    const handleForfeitCoins = (data: ForfeitCoinsData) => {
      console.log('Player forfeit coins:', data);
      setRoundStatusMessage(data.message);
      // Do not change gamePhase or reset game here
    };

    const handleGameEndedInsufficientFunds = (data: GameEndedInsufficientFundsData) => {
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
          // If opponent score is not in session.scores, try to get it from the general opponentScore state
          // This case might be unlikely if session.scores is comprehensive
          opponentFinalScore = opponentScore;
        }
      } else {
        // Fallback if socket.id is not available or scores are not in session
        // This uses the hook's current scores as a less precise fallback
        myFinalScore = yourScore;
        opponentFinalScore = opponentScore;
      }

      setFinalScores({ playerScore: myFinalScore, opponentScore: opponentFinalScore });
      setCanPlayAgain(data.canContinue); // Set canPlayAgain from event data
      stopMyTurnTimer();
      resetMyTurnTimer();
    };

    socket.on('match_found', handleMatchFound);
    socket.on('waiting_for_opponent', handleWaiting);
    socket.on('already_in_queue', handleAlreadyInQueue);
    socket.on('already_in_session', handleAlreadyInSession);
    socket.on('matchmaking_cancelled', handleMatchmakingCancelled); // Added
    socket.on('not_in_queue', handleNotInQueue);                 // Added
    socket.on('cannot_cancel_in_game', handleCannotCancelInGame); // Added
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
    socket.on('game_ended_insufficient_funds', handleGameEndedInsufficientFunds); // Added listener

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
      socket.off('game_ended_insufficient_funds', handleGameEndedInsufficientFunds); // Added cleanup
    };
  }, [socket, hasMadeChoiceThisRound, longestStreak, gamePhase, resetMyTurnTimer, startMyTurnTimer, stopMyTurnTimer, resetGameToStart, yourScore, opponentScore]); // Added yourScore and opponentScore to dependencies for fallback logic

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

  const handleStartGame = useCallback(() => {

    const hash = window.location.hash.slice(1);
    // console.log(hash); // tgWebAppData=...&tgWebAppVersion=6.2&...

    const params = new URLSearchParams(hash);
    // console.log({ version: params.get('tgWebAppVersion') });

    const tgWebAppData = params.get('tgWebAppData');

    // 4. Parse the inner tgWebAppData string
    const webAppParams = new URLSearchParams(tgWebAppData!);

    // 5. Get the 'user' data, which is a JSON string
    const userJsonString = webAppParams.get('user');

    // 6. Parse the JSON string into a JavaScript object
    const userObject = JSON.parse(userJsonString!)

    // const query = window.location.search
    // const decryptedQuery = decryptFromUrl(query)
    const nameFromQuery = 'chief10x'//userObject.username////getQueryParam(decryptedQuery, 'username')
    const telegramUserId = 212307244//userObject.id// //getQueryParam(decryptedQuery, 'userId')
    const groupOwner = undefined//getQueryParam(decryptedQuery, 'owner')
    const finalUsername = nameFromQuery || username.trim();

    if (!finalUsername) {
      setUserActionMessage("Please enter a username or ensure it's provided via query.");
      return;
    }
    if (socket && isConnected) {
      socket.emit('start', { username: finalUsername, userId: telegramUserId, groupOwner });
      if (!nameFromQuery) setUsername(finalUsername);
      setUserActionMessage('');
      setGamePhase('searching');
      setRoundStatusMessage('Searching for an opponent...');
    } else {
      setUserActionMessage("Cannot connect to server. Please wait or check server status.");
      if (socket && !isConnected) connectSocket();
    }
  }, [socket, isConnected, username, connectSocket]);

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
    gamePhase, username, myServerConfirmedUsername, opponentUsername,
    myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
    roundResult, roundReason, winStreak, longestStreak, yourScore, opponentScore,
    socketConnectionMessage, userActionMessage, roundStatusMessage,
    hasMadeChoiceThisRound, isConnected, sessionId,
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    joiningCountdown,
    // New state for game ended phase
    gameEndReason,
    finalScores,
    canPlayAgain, // Return canPlayAgain
    // Actions
    setUsername,
    handlePlayerChoice,
    handleStartGame,
    handleEndGame,
    handleCancelSearch, // Exposed if you want a direct cancel button
    resetGameToStart,   // Exposed if you want to call it directly for "go back"
  };
}