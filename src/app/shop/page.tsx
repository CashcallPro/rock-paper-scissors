"use client";

import { useRouter } from "next/navigation";

export default function Shop() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-8">Shop</h1>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-700 transition-colors"
      >
        Back
      </button>
    </div>
  );
}
