"use client";
import { InputText } from 'primereact/inputtext';
import { Suspense } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/lib';
import { BattleButton } from '../BattleButton';
import { HeaderButton } from '../HeaderButton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';



interface StartScreenProps {
  username: string;
  setUsername: (username: string) => void;
  onStartGame: () => void;
  connectionMessage: string;
  userActionMessage: string;
  longestStreak: number;
  isConnected: boolean;
  isUsernameFromQuery: boolean;
  userProfile: UserProfile | null;
}

export function StartScreen({
  username,
  setUsername,
  onStartGame,
  connectionMessage,
  userActionMessage,
  longestStreak,
  isConnected,
  isUsernameFromQuery,
}: StartScreenProps) {
  const router = useRouter();

  return (
    <Suspense>
      <>
        <div className="flex items-start z-10 w-full p-2 justify-between">
          <Link href="/shop">
            <HeaderButton onClick={() => { }} backgroundImage="url('/shop.png')" />
          </Link>
          <Link href="/gifts">
            <HeaderButton onClick={() => { }} backgroundImage="url('/gift.png')" />
          </Link>
        </div>
        <div
          className="w-full flex flex-col items-center justify-center h-full text-center px-4"
          style={{ backgroundColor: "transparent" }}
        >
          <Image
            alt=''
            src="/start-bg.png"
            layout='fill'
            objectFit='cover'
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              filter: 'brightness(0.5)',
            }}
          />
          <h1 style={{ color: 'white' }}>Welcome to</h1>
          <h1 className="text-8xl font-bold z-10" style={{ color: 'white' }}>RPS</h1>
          <h1 className="text-6xl font-bold z-10 mb-6" style={{ color: 'white' }}>ArenA</h1>

          <BattleButton
            onClick={onStartGame}
            disabled={!isConnected} />
          <div className="flex items-center justify-center text-white z-10">
            <span>10&nbsp;</span>
            <Image src="/gem.png" alt="gem" width={20} height={20} className="mx-1" />
            <span>&nbsp;per round</span>
          </div>
          {(connectionMessage || userActionMessage) && (
            <p className="mt-4 text-sm text-red-500 z-10">
              {userActionMessage || connectionMessage || (!isConnected && "Connecting...")}
            </p>
          )}
          {/* <div className="mt-8 text-xl font-medium z-10" style={{ color: 'white' }}>Longest Streak: {longestStreak}</div> */}
        </div>
      </>
    </Suspense>
  );
}