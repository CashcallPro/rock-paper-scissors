import React, { useEffect, useState, useRef } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children, buttonRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupWidth = 260; // Keep this in sync with the width in the style attribute
      setPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX - popupWidth,
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="absolute bg-gray-800 rounded-lg shadow-xl p-6 z-50"
      style={{ top: position.top, left: position.left, width: '300px' }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white hover:text-gray-400 text-2xl"
      >
        &times;
      </button>
      {children}
    </div>
  );
};

export default Popup;
