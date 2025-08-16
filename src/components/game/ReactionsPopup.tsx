import React, { useEffect, useState, useRef } from "react";
import { Reaction, reactionEmojis } from "../../lib";
import { ReactionButton } from "./ReactionButton";
import type { Button as PrimeReactButton } from 'primereact/button';

interface ReactionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReactionClick: (reaction: Reaction) => void;
  buttonRef: React.RefObject<PrimeReactButton | null>;
}

const ReactionsPopup: React.FC<ReactionsPopupProps> = ({
  isOpen,
  onClose,
  onReactionClick,
  buttonRef,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      setPosition({
        top: (buttonRef.current as any).offsetHeight + 5,
        left: 0,
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="absolute bg-gray-800 rounded-lg shadow-xl p-2 z-50 flex flex-col space-y-2"
      style={{ top: position.top, left: position.left }}
    >
      {(Object.keys(reactionEmojis) as Reaction[]).map((reaction) => (
        <ReactionButton
          key={reaction}
          reaction={reaction}
          onReactionClick={onReactionClick}
        />
      ))}
    </div>
  );
};

export default ReactionsPopup;
