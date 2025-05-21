"use client"
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Emojis mapping - consistent with server if server were to send 'rock', 'paper', 'scissors' strings
const choiceEmojis: Record<Choice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};
// Type for choices, consistent with backend
type Choice = 'rock' | 'paper' | 'scissors';

// Result messages from the server
type ServerResult = 'You won!' | 'You lost!' | "It's a tie!" | '';

type GamePhase = 'start' | 'searching' | 'opponentFound' | 'joining' | 'playing';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://rps-api.cashcall.pro/'; // Ensure this matches your backend

export default function Home() {

  const queryParams = useSearchParams()

  // Player & Opponent visual state
  const [myChoiceEmoji, setMyChoiceEmoji] = useState<string>('');
  const [myChoiceAnimate, setMyChoiceAnimate] = useState<boolean>(false);
  const [opponentChoiceEmoji, setOpponentChoiceEmoji] = useState<string>('');
  const [opponentChoiceAnimate, setOpponentChoiceAnimate] = useState<boolean>(false);

  const [roundResult, setRoundResult] = useState<ServerResult>('');
  const [roundReason, setRoundReason] = useState<string>(''); // For timeout reasons etc.
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState<string>('100vh');
  const [yourScore, setYourScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>();

  // Game flow & multiplayer state
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [joiningCountdown, setJoiningCountdown] = useState<number>(2); // Renamed for clarity
  const [username, setUsername] = useState<string>('');
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [myServerConfirmedUsername, setMyServerConfirmedUsername] = useState<string | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string | null>(null);

  // UI messages and controls
  const [connectionMessage, setConnectionMessage] = useState<string>('');
  const [roundStatusMessage, setRoundStatusMessage] = useState<string>('');
  const [hasMadeChoiceThisRound, setHasMadeChoiceThisRound] = useState<boolean>(false);

  // Turn Timer State
  const [isMyTurnTimerActive, setIsMyTurnTimerActive] = useState<boolean>(false);
  const [turnTimerDuration, setTurnTimerDuration] = useState<number>(0); // Total duration from server
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(0);
  const turnTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle making a choice
  const handlePlayerChoice = (choice: Choice): void => {
    if (!socket || !sessionId || hasMadeChoiceThisRound || !socket.connected) return;

    setMyChoiceEmoji(choiceEmojis[choice]);
    setMyChoiceAnimate(true);
    setOpponentChoiceEmoji('?');
    setRoundResult('');
    setRoundReason('');

    socket.emit('make_choice', { sessionId, choice });
    setHasMadeChoiceThisRound(true);
    setRoundStatusMessage('Choice locked! Waiting for opponent...');

    // Stop my own turn timer if it was running
    if (isMyTurnTimerActive) {
      setIsMyTurnTimerActive(false);
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    }
  };

  // Function to start the local turn timer display
  const startMyTurnTimer = (duration: number) => {
    setIsMyTurnTimerActive(true);
    setTurnTimerDuration(duration);
    setTurnTimeRemaining(duration)

    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);

    turnTimerIntervalRef.current = setInterval(() => {
      setTurnTimeRemaining(prevTime => {
        if (prevTime <= 100) { // Give a little buffer for network
          clearInterval(turnTimerIntervalRef.current!);
          setIsMyTurnTimerActive(false);
          // Don't auto-submit or assume loss here, wait for server's definitive 'round_result'
          // Optionally, disable choice buttons if timer reaches zero client-side
          // setHasMadeChoiceThisRound(true); // Effectively disables buttons
          setRoundStatusMessage("Time's up! Waiting for server result...");
          return 0;
        }
        return prevTime - 100; // Update every 100ms for smoother bar
      });
    }, 100);
  };

  // Effect for Socket.IO connection and event listeners
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { /* ... reconnection options ... */ });
    setSocket(newSocket);
    // ... (connect, connect_error, disconnect listeners as before) ...
    newSocket.on('connect', () => { /* ... */ setConnectionMessage(''); });
    newSocket.on('connect_error', (err) => { /* ... */ setConnectionMessage(`Connection failed...`); });
    newSocket.on('disconnect', (reason) => { /* ... */
      setConnectionMessage('Disconnected...');
      setIsMyTurnTimerActive(false); // Stop timer on disconnect
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    });

    newSocket.on('match_found', (data: { sessionId: string; opponent: string; yourUsername: string }) => {
      console.log('Match found:', data);
      setSessionId(data.sessionId);
      setOpponentUsername(data.opponent);
      setMyServerConfirmedUsername(data.yourUsername);
      setGamePhase('opponentFound');
      setWinStreak(0);
      setRoundStatusMessage('');
      setHasMadeChoiceThisRound(false);
      setIsMyTurnTimerActive(false); // Reset timer state
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    });

    newSocket.on('waiting_for_opponent', (data: { message: string }) => { /* ... */ });
    newSocket.on('already_in_queue', (data: { message: string }) => { /* ... reset states ... */
      setGamePhase('start');
      setConnectionMessage(data.message);
    });

    newSocket.on('choice_registered', (data: { message: string }) => {
      console.log(data.message);
      setRoundStatusMessage(data.message || 'Choice registered. Waiting for opponent.');
    });

    newSocket.on('opponent_made_choice', (data: {
      message: string;
      timerDetails?: { activeFor: string; duration: number }
    }) => {
      console.log('Opponent made choice:', data);
      setRoundStatusMessage(data.message);

      if (data.timerDetails && data.timerDetails.activeFor === newSocket.id && !hasMadeChoiceThisRound) {
        // This timer is for me, and I haven't chosen yet
        startMyTurnTimer(data.timerDetails.duration);
      } else if (hasMadeChoiceThisRound) {
        // I've already chosen, opponent is the one who just chose.
        setRoundStatusMessage('Opponent has chosen. Revealing results...');
        setIsMyTurnTimerActive(false); // My timer shouldn't be active if I chose
        if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
      }
    });

    newSocket.on('round_result', (data: {
      yourChoice: Choice | null; // Can be null if timed out
      opponentChoice: Choice | null; // Can be null if timed out
      result: ServerResult;
      reason?: string;
      scores: {[score: string]: number}
    }) => {
      console.log('Round Result:', data);

      setMyChoiceEmoji(data.yourChoice ? choiceEmojis[data.yourChoice] : '⏳'); // Show hourglass if timed out
      setMyChoiceAnimate(true);

      setOpponentChoiceEmoji(data.opponentChoice ? choiceEmojis[data.opponentChoice] : '⏳');
      setOpponentChoiceAnimate(true);

      setRoundResult(data.result);
      setRoundReason(data.reason || '');

      setYourScore(data.scores.currentPlayer)
      setOpponentScore(data.scores.opponent)

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
      setIsMyTurnTimerActive(false); // Stop timer if it was running
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    });

    newSocket.on('opponent_disconnected', (data: { message: string }) => { /* ... reset to start, clear timer ... */
      alert(data.message || "Opponent disconnected.");
      setGamePhase('start');
      setSessionId(null); /* other resets */
      setIsMyTurnTimerActive(false);
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    });

    newSocket.on('error_occurred', (data: { message: string }) => { /* ... alert error, clear timer ... */
      alert(`Error: ${data.message}`);
      setRoundStatusMessage(`Error: ${data.message}`);
      // If error was related to choice, allow trying again
      // setHasMadeChoiceThisRound(false);
      setIsMyTurnTimerActive(false);
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    });

    return () => {
      // ... (newSocket.off for all events) ...
      newSocket.off('connect'); newSocket.off('connect_error'); newSocket.off('disconnect');
      newSocket.off('match_found'); newSocket.off('waiting_for_opponent'); newSocket.off('already_in_queue');
      newSocket.off('choice_registered'); newSocket.off('opponent_made_choice');
      newSocket.off('round_result'); newSocket.off('opponent_disconnected'); newSocket.off('error_occurred');
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
      newSocket.disconnect();
      setSocket(null);
    };
  }, []); // Empty dependency ensures this runs once on mount

  // Animation useEffects
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

  // Screen height adjustment
  useEffect(() => {
    const updateHeight = (): void => {
      setScreenHeight(`${window.innerHeight}px`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Phase transition: OpponentFound -> Joining
  useEffect(() => {
    if (gamePhase === 'opponentFound') {
      const timer = setTimeout(() => {
        setJoiningCountdown(2);
        setGamePhase('joining');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  // Phase transition: Joining -> Playing
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
        setIsMyTurnTimerActive(false); // Ensure timer is not active at start of game
      }
    }
  }, [gamePhase, joiningCountdown]);


  const handleEndGame = async () => {
    const API_URL = `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/bot/score`

    const userId = queryParams.get('userId')
    const inlineMessageId = queryParams.get('inlineMessageId')

    if (!userId)
      return

    const scoreData = {
      clientInlineMessageId: inlineMessageId,
      userId: userId,
      score: longestStreak,
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });
    } catch (err) {
      console.error('Error submitting score:', err);      
    }
  }

  const handleStartGame = () => {

    const name = queryParams.get('username') ?? username.trim()

    if (!name.trim()) {
      alert("Please enter a username.");
      return;
    }
    if (socket && socket.connected) {
      socket.emit('start', { username: name });
      setUsername(name)
      // setMyServerConfirmedUsername(username.trim()); // Server will confirm via match_found
      setConnectionMessage('');
      setGamePhase('searching');
    } else {
      setConnectionMessage("Cannot connect to server. Please wait or check server status.");
      console.log("Socket status:", socket ? socket.connected : "socket is null");
      if (socket && !socket.connected) socket.connect(); // Attempt to reconnect
    }
  };

  // Render logic based on gamePhase
  const renderGameContent = () => {
    switch (gamePhase) {
      case 'start':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl font-bold mb-6">Rock Paper Scissors</h1>
            <div className="p-fluid mb-4 w-full max-w-xs">
              <span className="p-float-label flex-col">
                <InputText
                  id="username"
                  value={queryParams.get('username')}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-inputtext-lg" onKeyUp={(e) => e.key === 'Enter' && handleStartGame()}
                  placeholder='Enter user name' />
                <label htmlFor="username">Enter your username</label>
              </span>
            </div>
            <Button label="Start Game" className="text-xl py-3 px-6 md:py-4 md:px-8" size="large" onClick={handleStartGame} /*disabled={!socket || !socket.connected}*/ />
            {(!socket || !socket.connected || connectionMessage) && (
              <p className="mt-4 text-sm text-red-500">{connectionMessage || "Connecting..."}</p>
            )}
            <div className="mt-8 text-xl font-medium">Longest Streak: {longestStreak}</div>
          </div>
        );
      case 'searching':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-3xl font-medium">Looking for opponents...</h2>
            <p className="mt-2 text-gray-600">You: {username}</p> {/* Show entered username */}
            {/* Consider adding a PrimeReact ProgressSpinner here */}
          </div>
        );
      case 'opponentFound':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-3xl font-medium text-green-600">Opponent found!</h2>
            <p className="text-2xl mt-2">{myServerConfirmedUsername} vs {opponentUsername}</p>
          </div>
        );
      case 'joining':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-3xl font-medium">Game starting in...</h2>
            <p className="text-5xl font-bold mt-4">{joiningCountdown}</p>
          </div>
        );
      case 'playing':
        const timerProgress = turnTimerDuration > 0 ? (turnTimeRemaining / turnTimerDuration) * 100 : 0;
        return (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 pt-4 md:pt-2 text-center px-2">
              {myServerConfirmedUsername || 'You'} vs {opponentUsername || 'Opponent'}
            </h1>
            <div className="flex flex-row space-x-4 md:space-x-6 text-base sm:text-lg md:text-xl font-medium mb-2 text-center">
              <div>Win Streak: {winStreak}</div>
              <div>Longest Streak: {longestStreak}</div>
            </div>
            <div className="flex flex-row space-x-4 md:space-x-6 text-base sm:text-lg md:text-xl font-medium mb-2 text-center">
              <div>Your Score: {yourScore}</div>
              <div>Opponent Score: {opponentScore}</div>
            </div>

            {/* Timer Bar - Show only if my timer is active */}
            {isMyTurnTimerActive && (
              <div className="w-full max-w-md px-4 my-2">
                <ProgressBar value={timerProgress} showValue={false} style={{ height: '10px' }} />
                <p className="text-center text-sm text-red-500 mt-1">
                  Time remaining: {(turnTimeRemaining / 1000).toFixed(1)}s
                </p>
              </div>
            )}

            <div className="flex-grow w-full bg-white flex flex-col items-center justify-center space-y-1 sm:space-y-2 py-1 sm:py-2">
              {/* Opponent Side */}
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-500">{opponentUsername || 'Opponent'}</span>
                <div className={`text-5xl sm:text-6xl transform rotate-180 ${opponentChoiceAnimate ? 'animate-pop' : ''}`}>
                  {opponentChoiceEmoji || '?'}
                </div>
              </div>

              {/* Result/Status Message */}
              <div className="text-lg sm:text-xl font-medium h-auto min-h-[24px] sm:min-h-[28px] my-1 sm:my-2 text-center px-2">
                {roundResult ? `${roundResult}${roundReason ? ` (${roundReason})` : ''}` : roundStatusMessage || <> </>}
              </div>

              {/* My Side */}
              <div className="flex flex-col items-center">
                <div className={`text-5xl sm:text-6xl ${myChoiceAnimate ? 'animate-pop' : ''}`}>
                  {myChoiceEmoji || '?'}
                </div>
                <span className="text-xs sm:text-sm text-gray-500">{myServerConfirmedUsername || 'You'}</span>
              </div>
            </div>

            {/* Choice Buttons */}
            <div className="flex flex-row sm:flex-row gap-y-2 sm:gap-x-3 mb-4 sm:mb-6 px-4 w-full max-w-xs sm:max-w-md">
              {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
                <Button
                  key={choice}
                  label={`${choice.charAt(0).toUpperCase() + choice.slice(1)}\n${choiceEmojis[choice]}`}
                  className="p-button-rounded text-lg sm:text-lg md:text-xl py-2 sm:py-3 px-5 sm:px-4 flex-1"
                  onClick={() => handlePlayerChoice(choice)}
                  disabled={hasMadeChoiceThisRound || !socket?.connected || !sessionId}
                />
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen overflow-hidden flex flex-col items-center bg-gray-100" style={{ height: screenHeight }}>
      <Head>
        <title>
          {gamePhase === 'playing' ? `RPS: ${myServerConfirmedUsername} vs ${opponentUsername}` : 'Rock Paper Scissors - Multiplayer'}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className={`w-full flex flex-col items-center ${gamePhase === 'playing' ? 'justify-between' : 'justify-center flex-grow'}`} style={{ height: screenHeight }}>
        <div className='w-full flex flex-grow items-end'>         
          <Button label="Exit Game" className="text-xl py-3 px-6 md:py-4 md:px-8" size="large" onClick={handleEndGame} />
        </div>
        {renderGameContent()}
      </div>
    </div>
  );
}