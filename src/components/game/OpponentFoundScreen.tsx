"use client";
interface OpponentFoundScreenProps {
  myUsername: string | null;
  opponentUsername: string | null;
}

export function OpponentFoundScreen({ myUsername, opponentUsername }: OpponentFoundScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center px-4"
      style={{ backgroundImage: "url('/start-bg.png')" }}>

      <h2 className="text-3xl font-medium text-green-600">Opponent found!</h2>
      <p className="text-2xl mt-2 text-white">
        {myUsername || 'You'} vs {opponentUsername || 'Opponent'}
      </p>
    </div>
  );
}