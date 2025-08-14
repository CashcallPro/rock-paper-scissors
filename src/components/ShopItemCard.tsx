"use client";

import Image from 'next/image';
import React from 'react';

interface ShopItemCardProps {
  icon: string;
  amount: string | number;
  price: string;
  onPurchase: () => void;
}

export function ShopItemCard({ icon, amount, price, onPurchase }: ShopItemCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-between text-white shadow-lg w-40 h-52">
      <div className="w-16 h-16 relative">
        <Image src={icon} alt="item icon" layout="fill" objectFit="contain" />
      </div>
      <div className="text-center my-2">
        <p className="text-xl font-bold">{amount}</p>
        <p className="text-gray-400">{price}</p>
      </div>
      <button
        onClick={onPurchase}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Purchase
      </button>
    </div>
  );
}
