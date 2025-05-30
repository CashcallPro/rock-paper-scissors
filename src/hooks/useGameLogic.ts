"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Choice, ServerResult, GamePhase, choiceEmojis, MatchFoundData, RoundResultData, OpponentMadeChoiceData, API_URL_BOT_SCORE, SOCKET_SERVER_URL } from '../lib';
import { useSocketConnection } from './useSocketConnection';
import { useTurnTimer } from './useTurnTimer';

export function useGameLogic() {
  const queryParams = useSearchParams();
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
      resetGameToStart(data.message || "Opponent disconnected. The game has ended.");
    };

    const handleGameEndedByServer = (data: { message: string; initiator?: string }) => {
      console.log('Game ended by server/opponent:', data);
      const endMessage = data.initiator ? `${data.initiator} ended the game.` : (data.message || "The game has ended.");
      resetGameToStart(endMessage);
    };

    const handleErrorOccurred = (data: { message: string }) => {
      setUserActionMessage(`Error: ${data.message}`);
      console.error('Error from server:', data.message);
      stopMyTurnTimer();
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
    };
  }, [socket, hasMadeChoiceThisRound, longestStreak, gamePhase, resetMyTurnTimer, startMyTurnTimer, stopMyTurnTimer, resetGameToStart]);

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
    const nameFromQuery = queryParams.get('username');
    const telegramUserId = queryParams.get('userId')
    const finalUsername = nameFromQuery || username.trim();

    if (!finalUsername) {
      setUserActionMessage("Please enter a username or ensure it's provided via query.");
      return;
    }
    if (socket && isConnected) {
      socket.emit('start', { username: finalUsername, userId: telegramUserId });
      if (!nameFromQuery) setUsername(finalUsername);
      setUserActionMessage('');
      setGamePhase('searching');
      setRoundStatusMessage('Searching for an opponent...');
    } else {
      setUserActionMessage("Cannot connect to server. Please wait or check server status.");
      if (socket && !isConnected) connectSocket();
    }
  }, [socket, isConnected, username, queryParams, connectSocket]);

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

    const userId = queryParams.get('userId');
    const inlineMessageId = queryParams.get('inlineMessageId');

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
    resetGameToStart("You ended the game. Play again?");
  }, [socket, sessionId, isConnected, queryParams, yourScore, longestStreak, resetGameToStart, API_URL_BOT_SCORE]);


  return {
    // State
    gamePhase, username, myServerConfirmedUsername, opponentUsername,
    myChoiceEmoji, myChoiceAnimate, opponentChoiceEmoji, opponentChoiceAnimate,
    roundResult, roundReason, winStreak, longestStreak, yourScore, opponentScore,
    socketConnectionMessage, userActionMessage, roundStatusMessage,
    hasMadeChoiceThisRound, isConnected, sessionId,
    isMyTurnTimerActive, turnTimerDuration, turnTimeRemaining, turnTimerProgress,
    joiningCountdown,
    // Actions
    setUsername,
    handlePlayerChoice,
    handleStartGame,
    handleEndGame,
    handleCancelSearch, // Exposed if you want a direct cancel button
    resetGameToStart,   // Exposed if you want to call it directly for "go back"
  };
}