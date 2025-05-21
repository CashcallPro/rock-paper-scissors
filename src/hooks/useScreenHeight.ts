"use client";
import { useState, useEffect } from 'react';

export function useScreenHeight() {
  const [screenHeight, setScreenHeight] = useState<string>('100vh');

  useEffect(() => {
    const updateHeight = (): void => {
      setScreenHeight(`${window.innerHeight}px`);
    };
    updateHeight(); // Initial call
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return screenHeight;
}