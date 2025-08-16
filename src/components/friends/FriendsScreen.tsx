"use client";

import Image from 'next/image';
import { IMAGES } from '@/lib/image-constants';

const mockFriends = [
  { id: 1, name: 'Alice', photo: IMAGES.FRIENDS_BG },
  { id: 2, name: 'Bob', photo: IMAGES.FRIENDS_BG },
  { id: 3, name: 'Charlie', photo: IMAGES.FRIENDS_BG },
  { id: 4, name: 'Diana', photo: IMAGES.FRIENDS_BG },
  { id: 5, name: 'Eve', photo: IMAGES.FRIENDS_BG },
];

interface FriendsScreenProps {
  onBack: () => void;
}

export default function FriendsScreen({ onBack }: FriendsScreenProps) {
  return (
    <div className="bg-gray-800 h-screen text-white w-full flex flex-col">
      <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <div className="flex flex-row items-center">
              <img src={IMAGES.BACK_ARROW} alt="Back" className="w-6 h-6" />
              <span className="ml-2">Back</span>
            </div>
          </button>
        </div>
      </div>

      <main className="p-4 flex-grow overflow-y-auto scrollbar-hide">
        <h1 className="text-4xl font-bold text-center mb-8">Friends</h1>
        <div className="flex flex-col gap-4 items-center">
          {mockFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between w-full max-w-sm p-2 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Image src={friend.photo} alt={friend.name} width={50} height={50} className="rounded-full" />
                <span className="ml-4 text-lg truncate">{friend.name}</span>
              </div>
              <button
                onClick={() => console.log(`Inviting ${friend.name}`)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
