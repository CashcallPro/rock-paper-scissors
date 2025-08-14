"use client";

import Header from "@/components/Header";
import { GiftItemCard } from "@/components/GiftItemCard";
import { UserProfile } from "@/lib/types";

const mockUser: UserProfile = {
  _id: "1",
  username: "Player1",
  tickets: 10,
  coins: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
  matches: [],
};

const gifts = [
  { icon: "/gem.png", name: "Check in daily" },
  { icon: "/ticket.png", name: "Follow twitter" },
  { icon: "/ticket.png", name: "Play 3 mathces" },
];

export default function Gifts() {
  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <Header user={mockUser} />
      <main className="p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Gifts</h1>
        <div className="flex flex-col items-center gap-4">
          {gifts.map((item, index) => (
            <GiftItemCard
              key={index}
              icon={item.icon}
              name={item.name}
              onUnlock={() => console.log("Unlocking", item.name)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
