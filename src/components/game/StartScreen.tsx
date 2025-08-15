"use client";
import { InputText } from 'primereact/inputtext';
import { Suspense } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/lib';
import { BattleButton } from '../BattleButton';
import { HeaderButton } from '../HeaderButton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../Header';



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
  onOpenShop: () => void;
  onOpenGifts: () => void;
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
  userProfile,
  onOpenShop,
  onOpenGifts,
}: StartScreenProps) {
  const router = useRouter();

  return (
    <Suspense>
      <>
        <Header
          user={userProfile}
        />
        <div className="flex items-start z-10 w-full p-2 justify-between">
          <HeaderButton onClick={onOpenShop} backgroundImage="url('/shop.png')" />
          <HeaderButton onClick={onOpenGifts} backgroundImage="url('/gift.png')" />
        </div>
        <div
          className="w-full flex flex-col items-center justify-center h-full text-center px-4"
          style={{ backgroundColor: "transparent" }}
        >
          <Image
            alt=''
            // src="/start-bg.png"
            src="https://s3dux5rwcu.ufs.sh/f/3pYCTPyYdTmWLNeh8UcS2TXZQmotuIlGziCbOfrqMU0yeN9A"
            layout='fill'
            objectFit='cover'
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              filter: 'brightness(0.6)',
            }}
          />
          <h1 className='z-10' style={{ color: 'white' }}>Welcome to</h1>
          <Image src={"/logo_rpstitan.png"} alt='logo' width={200} height={140} className='z-10 mb-16' />
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