"use client"
import Head from 'next/head';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';

type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'You won!' | 'You lost!' | "It's a tie!" | '';

const choices: Record<Choice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export default function Home() {
  const [userEmoji, setUserEmoji] = useState<string>('');
  const [userAnimate, setUserAnimate] = useState<boolean>(false);
  const [machineEmoji, setMachineEmoji] = useState<string>('');
  const [machineAnimate, setMachineAnimate] = useState<boolean>(false);
  const [result, setResult] = useState<Result>('');
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState<string>('100vh');

  const determineResult = (user: string, machine: string): Result => {
    if (user === machine) return "It's a tie!";
    if (
      (user === choices.rock && machine === choices.scissors) ||
      (user === choices.paper && machine === choices.rock) ||
      (user === choices.scissors && machine === choices.paper)
    ) {
      return "You won!";
    }
    return "You lost!";
  };

  const handleClick = (choice: Choice): void => {
    const userChoice = choices[choice];
    setUserEmoji(userChoice);
    setUserAnimate(true);

    const keys = Object.keys(choices) as Choice[];
    const randomChoice = keys[Math.floor(Math.random() * keys.length)];
    const machineChoice = choices[randomChoice];
    setMachineEmoji(machineChoice);
    setMachineAnimate(true);

    const outcome = determineResult(userChoice, machineChoice);
    setResult(outcome);

    if (outcome === "You won!") {
      setWinStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
        }
        return newStreak;
      });
    } else if (outcome === "You lost!") {
      setWinStreak(0);
    }
  };

  useEffect(() => {
    if (userAnimate) {
      const timer = setTimeout(() => setUserAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [userAnimate]);

  useEffect(() => {
    if (machineAnimate) {
      const timer = setTimeout(() => setMachineAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [machineAnimate]);

  useEffect(() => {
    const updateHeight = (): void => {
      setScreenHeight(`${window.innerHeight}px`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div
      className="w-screen overflow-hidden flex flex-col items-center justify-center bg-gray-100"
      style={{ height: screenHeight }}
    >
      <Head>
        <title>Rock Paper Scissors Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <h1 className="text-3xl font-bold mb-2">Rock Paper Scissors</h1>

      {/* Win Streak and Longest Streak container */}
      <div className="flex flex-row space-x-6 text-xl font-medium mb-4">
        <div>Win Streak: {winStreak}</div>
        <div>Longest Streak: {longestStreak}</div>
      </div>

      {/* Center container with vertical layout */}
      <div className="flex-grow w-full bg-white flex flex-col items-center justify-center space-y-4">
        <div className={`text-6xl transform rotate-180 ${machineAnimate ? 'animate-pop' : ''}`}>
          {machineEmoji}
        </div>
        <div className={`text-6xl ${userAnimate ? 'animate-pop' : ''}`}>
          {userEmoji}
        </div>
        <div className="text-xl font-medium">{result}</div>
      </div>

      {/* Horizontal buttons container */}
      <div className="flex flex-row gap-x-6 mb-6">
        <Button label="Rock ✊" className="p-button-rounded text-xl py-4 px-6 w-32" onClick={() => handleClick('rock')} />
        <Button label="Paper ✋" className="p-button-rounded text-xl py-4 px-6 w-32" onClick={() => handleClick('paper')} />
        <Button label="Scissors ✌️" className="p-button-rounded text-xl py-4 px-6 w-32" onClick={() => handleClick('scissors')} />
      </div>
    </div>
  );
}
