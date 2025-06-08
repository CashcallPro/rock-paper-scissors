"use client"; // Required for usePathname hook

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // For active link styling

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavLinkItem {
  href: string;
  label: string;
}

const navItems: NavLinkItem[] = [
  { href: '/', label: 'Play' },
  { href: '/quest', label: 'Quest' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow p-4 overflow-y-auto">
        {children}
      </main>
      <nav className="bg-gray-100 p-3 border-t border-gray-300">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-center px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150 ease-in-out
                  ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
