import React from 'react';
import { UserProfile } from '../lib/types';

interface HeaderProps {
  user: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  if (!user) {
    return null; // Don't render the header if there is no user
  }

  return (
    <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center">
        {user.photo_url ? (
          <img src={user.photo_url} alt={user.username} className="w-10 h-10 rounded-full mr-3" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 mr-3"></div>
        )}
        <span className="font-bold text-lg">{user.username}</span>
      </div>
      <div className="flex items-center text-lg">
        <div className="mr-5">
          <span role="img" aria-label="energy">⚡️</span> {user.coins ?? 0}
        </div>
        <div>
          <span role="img" aria-label="tickets">🎟️</span> {user.tickets ?? 0}
        </div>
      </div>
    </div>
  );
};

export default Header;
