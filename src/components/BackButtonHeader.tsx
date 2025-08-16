"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { IMAGES } from '@/lib/image-constants';

const BackButtonHeader: React.FC = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center">
        <button onClick={goBack} className="mr-3">
          <img src={IMAGES.BACK_ARROW} alt="Back" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default BackButtonHeader;
