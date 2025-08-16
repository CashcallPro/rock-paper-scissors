import { Button } from "primereact/button";
import { Reaction, reactionEmojis } from "../../lib";

interface ReactionButtonProps {
  reaction: Reaction;
  onReactionClick: (reaction: Reaction) => void;
}

export const ReactionButton = ({ reaction, onReactionClick }: ReactionButtonProps) => {
  return (
    <div className="w-10 h-10 items-center justify-center">
      <Button onClick={() => onReactionClick(reaction as Reaction)}>
        <span className="text-3xl">{reactionEmojis[reaction]}</span>
      </Button>
    </div>
  );
};
