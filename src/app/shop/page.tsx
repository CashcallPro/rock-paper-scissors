"use client";

import Header from "@/components/Header";
import { ShopItemCard } from "@/components/ShopItemCard";
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

const gems = [
  { icon: "/shopgem1.png", amount: "100 Gems", price: "$0.99" },
  { icon: "/shopgem2.png", amount: "500 Gems", price: "$4.99" },
  { icon: "/shopgem3.png", amount: "1200 Gems", price: "$9.99" },
];

const tickets = [
  { icon: "/ticket.png", amount: "10 Tickets", price: "100 Gems" },
  { icon: "/ticket.png", amount: "50 Tickets", price: "450 Gems" },
  { icon: "/ticket.png", amount: "120 Tickets", price: "1000 Gems" },
];

export default function Shop() {
  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <Header user={mockUser} />
      <main className="p-4">
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
