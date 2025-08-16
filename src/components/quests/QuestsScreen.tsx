"use client";

import { QuestItemCard } from "@/components/QuestItemCard";
import { IMAGES } from "@/lib/image-constants";
import { useUser } from "@/context/UserContext";

const quests = [
  {
    name: "Daily Quest",
    amount: "10 Gems",
    rewardImage: IMAGES.QUESTS_BG,
    isAd: false,
  },
  {
    name: "Special Offer",
    amount: "5 Tickets",
    rewardImage: IMAGES.QUESTS_BG,
    adImage: IMAGES.QUESTS_BG,
    isAd: true,
  },
];

interface QuestsScreenProps {
  onBack: () => void;
}

export default function QuestsScreen({ onBack }: QuestsScreenProps) {
  const { userProfile } = useUser();

  return (
    <div className="bg-gray-800 min-h-screen text-white w-full flex flex-col ">
      <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <div className='flex flex-row items-center'>
              <img src={IMAGES.BACK_ARROW} alt="Back" className="w-6 h-6" />
              <span className="ml-2">Back</span>
            </div>
          </button>
        </div>
      </div>
      <main className="p-4 flex-grow overflow-y-auto scrollbar-hide">
        <h1 className="text-4xl font-bold text-center mb-8">Quests</h1>
        <div className="flex flex-col items-center gap-4">
          {quests.map((item, index) => (
            <QuestItemCard
              key={index}
              name={item.name}
              amount={item.amount}
              rewardImage={item.rewardImage}
              adImage={item.adImage}
              isAd={item.isAd}
              onUnlock={() => console.log("Unlocking", item.name)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
