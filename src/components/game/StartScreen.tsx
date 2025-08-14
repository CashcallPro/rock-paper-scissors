"use client";
import { InputText } from 'primereact/inputtext';
import { Suspense } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/lib';
import { BattleButton } from '../BattleButton';
import { HeaderButton } from '../HeaderButton';
import { useRouter } from 'next/navigation';



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
        <div className="items-start z-10 w-full">
          <HeaderButton
            onClick={() => router.push('/shop')}
            backgroundImage="url('/shop.png')"
          />
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
            }}
          />
          <h1 className="text-8xl font-bold z-10" style={{ color: 'white' }}>RPS</h1>
          <h1 className="text-6xl font-bold z-10 mb-6" style={{ color: 'white' }}>ArenA</h1>
          <div className="p-fluid mb-4 w-full max-w-xs">
            <span className="p-float-label flex-col">
              <h1 style={{ color: 'white' }}>Welcome to Battle</h1>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-inputtext-lg text-4xl"
                style={{
                  textAlign: 'center',
                  color: 'white',
                }}
                onKeyUp={(e) => e.key === 'Enter' && onStartGame()}
                placeholder="wait"
                disabled={isUsernameFromQuery} // Disable if username from query
              />
            </span>
          </div>
          <BattleButton
            onClick={onStartGame}
            disabled={!isConnected} />
          <p className='text-white z-10'>10 energy per round</p>
          {(connectionMessage || userActionMessage) && (
            <p className="mt-4 text-sm text-red-500 z-10">
              {userActionMessage || connectionMessage || (!isConnected && "Connecting...")}
            </p>
          )}
          <div className="mt-8 text-xl font-medium z-10" style={{ color: 'white' }}>Longest Streak: {longestStreak}</div>
        </div>
      </>
    </Suspense>
  );
}