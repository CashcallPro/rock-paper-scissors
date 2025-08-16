"use client";

import { ShopItemCard } from "@/components/ShopItemCard";
import { IMAGES } from "@/lib/image-constants";
import { useUser } from "@/context/UserContext";

const gems = [
  { icon: IMAGES.SHOP_GEM_1, amount: "100 Gems", price: "$0.99" },
  { icon: IMAGES.SHOP_GEM_2, amount: "500 Gems", price: "$4.99" },
  { icon: IMAGES.SHOP_GEM_3, amount: "1200 Gems", price: "$9.99" },
];

const tickets = [
  { icon: IMAGES.TICKET, amount: "10 Tickets", price: "100 Gems" },
  { icon: IMAGES.TICKET, amount: "50 Tickets", price: "450 Gems" },
  { icon: IMAGES.TICKET, amount: "120 Tickets", price: "1000 Gems" },
];

interface ShopScreenProps {
  onBack: () => void;
}

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const { userProfile } = useUser();

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

      {/* 🔧 Make this scrollable */}
      <main className="p-4 flex-grow overflow-y-auto scrollbar-hide">
        <h1 className="text-4xl font-bold text-center mb-8">Shop</h1>
        <div className="flex justify-center gap-8">
          {/* Gems Column */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center mb-4">Gems</h2>
            {gems.map((item, index) => (
              <ShopItemCard
                key={index}
                icon={item.icon}
                amount={item.amount}
                price={item.price}
                onPurchase={() => console.log("Purchasing", item.amount)}
              />
            ))}
          </div>
          {/* Tickets Column */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center mb-4">Tickets</h2>
            {tickets.map((item, index) => (
              <ShopItemCard
                key={index}
                icon={item.icon}
                amount={item.amount}
                price={item.price}
                onPurchase={() => console.log("Purchasing", item.amount)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
