"use client";
import { InputText } from 'primereact/inputtext';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { SOCKET_SERVER_URL, UserProfile } from '@/lib';
import { retrieveLaunchParams, useLaunchParams, } from '@telegram-apps/sdk-react';



interface StartScreenProps {
  username: string;
  setUsername: (username: string) => void;
  onStartGame: () => void;
  connectionMessage: string;
  userActionMessage: string;
  longestStreak: number;
  isConnected: boolean;
}

export function StartScreen({
  username,
  setUsername,
  onStartGame,
  connectionMessage,
  userActionMessage,
  longestStreak,
  isConnected,
}: StartScreenProps) {

  const [queryUsername, setQueryusername] = useState<string>()
  const [user, setUser] = useState<UserProfile>()
  // const rawLaunchParams = useLaunchParams()
  // const rawInitData = useRawInitData()

  useEffect(() => {

    // const { initDataRaw, initData } = retrieveLaunchParams();

    // console.log({ initDataRaw })
    // console.log({ initData })

    // console.log({ query: rawLaunchParams })
    // console.log({ rawInitData: rawInitData })

    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const tgWebAppData = params.get('tgWebAppData');
    const webAppParams = new URLSearchParams(tgWebAppData!);
    const userJsonString = webAppParams.get('user');
    const userObject = JSON.parse(userJsonString!);

    // const decryptedQuery = decryptFromUrl(query)
    const queryUsername = userObject.username//getQueryParam(decryptedQuery, 'username')

    if (queryUsername) {
      setUsername(queryUsername)
      setQueryusername(queryUsername)

      fetch(`${SOCKET_SERVER_URL}/users/${queryUsername}`)
        .then(res => res.json())
        .then(resJson => {
          setUser(resJson)
        })
    }

  }, [])

  return (
    <Suspense>
      <>
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
              zIndex: -100
            }}
          />
          <h1 className="text-8xl font-bold z-10" style={{ color: 'white' }}>RPS</h1>
          <h1 className="text-6xl font-bold z-10 mb-6" style={{ color: 'white' }}>ArenA</h1>
          <div className="p-fluid mb-4 w-full max-w-xs">
            <span className="p-float-label flex-col">
              <h1 style={{ color: 'white' }}>Welcome to Battle</h1>
              {
                user &&
                <h1 style={{ color: 'white' }}>Your Total Coins: ${user.coins}</h1>
              }
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
                disabled={!!queryUsername} // Disable if username from query
              />
            </span>
          </div>
          <button
            onClick={onStartGame}
            disabled={!isConnected} // Apply disabled state to the button wrapper
            className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-150 ease-in-out z-10
                      ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <Image
              src="/btn-play.svg" // Path relative to the public folder
              alt="Start Game"
              width={250} // Specify a base width (adjust as needed)
              height={80} // Specify a base height (adjust as needed)
              className={`object-contain ${!isConnected ? '' : 'cursor-pointer'}`}
              priority // If it's an LCP element
            />
          </button>
          <p className='text-white z-10'>10$ per round</p>
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