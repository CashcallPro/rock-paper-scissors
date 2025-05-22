"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Choice, ServerResult, GamePhase, choiceEmojis, MatchFoundData, RoundResultData, OpponentMadeChoiceData, API_URL_BOT_SCORE, SOCKET_SERVER_URL } from '../lib'; // Assuming index.ts in lib exports all
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
  const [myChoiceEmoji, setMyChoiceEmoji] = useState<string>('');
  const [myChoiceAnimate, setMyChoiceAnimate] = useState<boolean>(false);
  const [opponentChoiceEmoji, setOpponentChoiceEmoji] = useState<string>('');
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
  const [username, setUsername] = useState<string>(''); // For input field
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [myServerConfirmedUsername, setMyServerConfirmedUsername] = useState<string | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);

  // UI messages and controls
  const [userActionMessage, setUserActionMessage] = useState<string>(''); // For start game errors, etc.
  const [roundStatusMessage, setRoundStatusMessage] = useState<string>('');
  const [hasMadeChoiceThisRound, setHasMadeChoiceThisRound] = useState<boolean>(false);

  // Animation Triggers (simple enough to keep here, or make a tiny hook)
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
      setWinStreak(0); // Reset for new game
      setYourScore(0);
      setOpponentScore(0);
      setRoundStatusMessage('');
      setHasMadeChoiceThisRound(false);
      resetMyTurnTimer();
    };

    const handleWaiting = (data: { message: string }) => {
      setRoundStatusMessage(data.message); // Or a different state for general game messages
    };

    const handleAlreadyInQueue = (data: { message: string }) => {
      setGamePhase('start');
      setUserActionMessage(data.message);
      // Reset relevant states
      setSessionId(null);
      setOpponentUsername(null);
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
      alert(data.message || "Opponent disconnected.");
      setGamePhase('start');
      // Reset game state
      setSessionId(null);
      setOpponentUsername(null);
      setMyChoiceEmoji('?');
      setOpponentChoiceEmoji('?');
      setRoundResult('');
      setYourScore(0);
      setOpponentScore(undefined);
      stopMyTurnTimer();
    };

    const handleErrorOccurred = (data: { message: string }) => {
      alert(`Error: ${data.message}`);
      setRoundStatusMessage(`Error: ${data.message}`);
      // Optionally reset choice state if error is related to making a choice
      // setHasMadeChoiceThisRound(false);
      stopMyTurnTimer();
    };

    socket.on('match_found', handleMatchFound);
    socket.on('waiting_for_opponent', handleWaiting);
    socket.on('already_in_queue', handleAlreadyInQueue);
    socket.on('choice_registered', handleChoiceRegistered);
    socket.on('opponent_made_choice', handleOpponentMadeChoice);
    socket.on('round_result', handleRoundResult);
    socket.on('opponent_disconnected', handleOpponentDisconnected);
    socket.on('error_occurred', handleErrorOccurred);

    return () => {
      socket.off('match_found', handleMatchFound);
      socket.off('waiting_for_opponent', handleWaiting);
      socket.off('already_in_queue', handleAlreadyInQueue);
      socket.off('choice_registered', handleChoiceRegistered);
      socket.off('opponent_made_choice', handleOpponentMadeChoice);
      socket.off('round_result', handleRoundResult);
      socket.off('opponent_disconnected', handleOpponentDisconnected);
      socket.off('error_occurred', handleErrorOccurred);
    };
  }, [socket, hasMadeChoiceThisRound, longestStreak, resetMyTurnTimer, startMyTurnTimer, stopMyTurnTimer]);

  // Game Phase Transitions
  useEffect(() => {
    if (gamePhase === 'opponentFound') {
      const timer = setTimeout(() => {
        setJoiningCountdown(2); // Reset countdown for this phase
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
        resetMyTurnTimer(); // Ensure timer is reset at start of play
      }
    }
  }, [gamePhase, joiningCountdown, resetMyTurnTimer]);

  // Actions
  const handlePlayerChoice = useCallback((choice: Choice): void => {
    if (!socket || !sessionId || hasMadeChoiceThisRound || !isConnected) return;

    setMyChoiceEmoji(choiceEmojis[choice]);
    setMyChoiceAnimate(true);
    setOpponentChoiceEmoji('?'); // Keep opponent hidden until result
    setRoundResult('');
    setRoundReason('');

    socket.emit('make_choice', { sessionId, choice });
    setHasMadeChoiceThisRound(true);
    setRoundStatusMessage('Choice locked! Waiting for opponent...');
    stopMyTurnTimer(); // Stop local timer as choice is made
  }, [socket, sessionId, hasMadeChoiceThisRound, isConnected, stopMyTurnTimer]);

  const handleStartGame = useCallback(() => {
    const nameFromQuery = queryParams.get('username');
    const finalUsername = nameFromQuery || username.trim(); // Prioritize query param

    if (!finalUsername) {
      setUserActionMessage("Please enter a username or ensure it's provided via query.");
      return;
    }
    if (socket && isConnected) {
      socket.emit('start', { username: finalUsername });
      if (!nameFromQuery) setUsername(finalUsername); // Update state if it came from input
      setUserActionMessage('');
      setGamePhase('searching');
    } else {
      setUserActionMessage("Cannot connect to server. Please wait or check server status.");
      if (socket && !isConnected) connectSocket(); // Attempt to reconnect
    }
  }, [socket, isConnected, username, queryParams, connectSocket]);

  const handleEndGame = useCallback(async () => {
    const userId = queryParams.get('userId');
    const inlineMessageId = queryParams.get('inlineMessageId');

    if (userId && longestStreak > 0) { // Only submit if there's a score and userId
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
    // Reset to start screen regardless of submission success
    setGamePhase('start');
    setSessionId(null);
    setOpponentUsername(null);
    setMyServerConfirmedUsername(null);
    setYourScore(0);
    setOpponentScore(undefined);
    setWinStreak(0);
    // longestStreak is preserved until a new game resets it or user refreshes
    resetMyTurnTimer();
  }, [queryParams, longestStreak, resetMyTurnTimer]);

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
    // Animation triggers (could be part of specific components if preferred)
    setMyChoiceAnimate,
    setOpponentChoiceAnimate,
  };
}
