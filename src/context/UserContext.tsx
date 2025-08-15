"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TelegramUser, UserProfile } from '@/lib/types';
import { SOCKET_SERVER_URL } from '@/lib/constants';

interface UserContextType {
  telegramUser: TelegramUser | null;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
  opponentProfile: UserProfile | null;
  setOpponentProfile: (profile: UserProfile | null) => void;
  username: string;
  setUsername: (name: string) => void;
  isUsernameFromQuery: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState<string>('');
  const [isUsernameFromQuery, setIsUsernameFromQuery] = useState<boolean>(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const tgWebAppData = params.get('tgWebAppData');
      if (!tgWebAppData) return;

      const webAppParams = new URLSearchParams(tgWebAppData);
      const userJsonString = webAppParams.get('user');
      if (userJsonString) {
        const userObject: TelegramUser = JSON.parse(userJsonString);
        setTelegramUser(userObject);
        if (userObject.username) {
          setUsername(userObject.username);
          setIsUsernameFromQuery(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse user data from URL:", error);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetch(`${SOCKET_SERVER_URL}/users/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setUserProfile(data);
          }
        })
        .catch(error => console.error('Failed to fetch user profile:', error));
    }
  }, [username]);

  const value = {
    telegramUser,
    userProfile,
    setUserProfile,
    opponentProfile,
    setOpponentProfile,
    username,
    setUsername,
    isUsernameFromQuery,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
