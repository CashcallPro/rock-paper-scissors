"use client";

import Header from "@/components/Header";
import { GiftItemCard } from "@/components/GiftItemCard";
import { UserProfile } from "@/lib/types";
import { useUser } from "@/context/UserContext";

const gifts = [
  { icon: "/gem.png", name: "Check in daily" },
  { icon: "/ticket.png", name: "Follow twitter" },
  { icon: "/gem.png", name: "Play 3 mathces" },
  { icon: "/ticket.png", name: "Win 10 mathces" },
];

export default function Gifts() {
  const { userProfile } = useUser()
  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <Header user={userProfile} variant="back" />
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
