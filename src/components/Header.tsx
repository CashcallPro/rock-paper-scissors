"use client";

import React, { useState, useRef } from 'react';
import { UserProfile } from '../lib/types';
import Popup from './Popup';
import { HeaderButton } from './HeaderButton';
import { IMAGES } from '@/lib/image-constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface HeaderProps {
  user: UserProfile | null;
  variant?: 'default' | 'back';
}

const Header: React.FC<HeaderProps> = ({ user, variant = 'default' }) => {
  const [isEnergyPopupOpen, setIsEnergyPopupOpen] = useState(false);
  const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false);

  const energyButtonRef = useRef<HTMLButtonElement>(null);
  const ticketButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  if (!user) {
    return null; // Don't render the header if there is no user
  }

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <div className="w-full bg-black/60 text-white p-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          {variant === 'back' ? (
            <button onClick={goBack} className="mr-3">
              <div className='flex flex-row'>
                <img src={IMAGES.BACK_ARROW} alt="Back" className="w-6 h-6" />
                back
              </div>
            </button>
          ) : (
            <>
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.username} className="w-10 h-10 rounded-full mr-3" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-500 mr-3 flex items-center justify-center">
                  <img src={IMAGES.ARMOR} alt={user.username} className="w-8 h-8" />
                </div>
              )}
              <span className="font-bold text-lg">{user.username}</span>
            </>
          )}
        </div>
        <div className="flex items-center text-lg space-x-4">
          <div className='flex items-center space-x-2'>
            <HeaderButton ref={energyButtonRef} onClick={() => setIsEnergyPopupOpen(true)} backgroundImage={`url('${IMAGES.GIFT_BG}')`} />
            <span role="img" aria-label="energy">{user.coins ?? 0}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <HeaderButton ref={ticketButtonRef} onClick={() => setIsTicketPopupOpen(true)} backgroundImage={`url('${IMAGES.TICKET}')`} />
            <span role="img" aria-label="tickets">{user.tickets ?? 0}</span>
          </div>
        </div>
      </div>
      <Popup isOpen={isEnergyPopupOpen} onClose={() => setIsEnergyPopupOpen(false)} buttonRef={energyButtonRef}>
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Energy</h2>
          <p className="text-white mb-4">You can convert tickets to energy.</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Convert Ticket to Energy
          </button>
        </div>
      </Popup>
      <Popup isOpen={isTicketPopupOpen} onClose={() => setIsTicketPopupOpen(false)} buttonRef={ticketButtonRef}>
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Tickets</h2>
          <p className="text-white mb-4">You can purchase more tickets.</p>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Purchase
          </button>
        </div>
      </Popup>
    </>
  );
};

export default Header;
