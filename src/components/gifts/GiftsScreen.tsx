"use client";

import { GiftItemCard } from "@/components/GiftItemCard";
import { useUser } from "@/context/UserContext";

const gifts = [
  { icon: "/gem.png", name: "Check in daily", amount: "10 Gems" },
  { icon: "/ticket.png", name: "Follow twitter", amount: "5 Tickets" },
  { icon: "/gem.png", name: "Play 3 mathces", amount: "20 Gems" },
  { icon: "/ticket.png", name: "Win 10 mathces", amount: "10 Tickets" },
];

interface GiftsScreenProps {
  onBack: () => void;
}

export default function GiftsScreen({ onBack }: GiftsScreenProps) {
  const { userProfile } = useUser();

  return (
    <div className="bg-gray-800 min-h-screen text-white w-full flex flex-col">
      <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <div className='flex flex-row items-center'>
              <img src="/back-arrow.svg" alt="Back" className="w-6 h-6" />
              <span className="ml-2">Back</span>
            </div>
          </button>
        </div>
      </div>
      <main className="p-4 flex-grow">
        <h1 className="text-4xl font-bold text-center mb-8">Gifts</h1>
        <div className="flex flex-col items-center gap-4">
          {gifts.map((item, index) => (
            <GiftItemCard
              key={index}
              icon={item.icon}
              name={item.name}
              amount={item.amount}
              onUnlock={() => console.log("Unlocking", item.name)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
