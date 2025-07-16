'use client';

import telegramAnalytics from '@telegram-apps/analytics';
import { useEffect } from 'react';

// This component will wrap our application and initialize the analytics
export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // We run this initialization logic only once when the component mounts on the client
    try {
      telegramAnalytics.init({
        // Your app name.
        // It's a good practice to use environment variables for this.
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'my-app',
        // Your app version.
        token: process.env.NEXT_PUBLIC_TOKEN || 'token',
      });
      console.log('Telegram Analytics Initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram Analytics', error);
    }
  }, []); // The empty dependency array ensures this runs only once.

  return <>{children}</>;
}