import React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-1/2 flex flex-col justify-center items-center" style={{ height: '30vh' }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-400 text-2xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
