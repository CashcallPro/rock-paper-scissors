"use client";
import Image from 'next/image';

interface JoiningScreenProps {
  countdown: number;
}

export function JoiningScreen({ countdown }: JoiningScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4">
      <h2 className="text-3xl font-medium text-white z-10">Game starting in...</h2>
      <p className="text-5xl font-bold mt-4 text-white z-10">{countdown}</p>
    </div>
  );
}