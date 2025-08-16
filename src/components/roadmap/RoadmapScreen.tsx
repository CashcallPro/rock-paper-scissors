"use client";

interface RoadmapItem {
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Planned';
}

const roadmapItems: RoadmapItem[] = [
  {
    title: "Basic Game Logic",
    description: "Core rock-paper-scissors mechanics implemented.",
    status: "Completed",
  },
  {
    title: "Multiplayer Backend",
    description: "Real-time PvP server powered by Socket.IO.",
    status: "Completed",
  },
  {
    title: "Frontend UI",
    description: "Game UI: start screen, match screen, overlays.",
    status: "In Progress",
  },
  {
    title: "Shop System",
    description: "Buy/Sell Gems & Tickets via TON & Telegram Stars.",
    status: "Planned",
  },
  {
    title: "Quest System",
    description: "Daily, weekly, and event-based quests.",
    status: "Planned",
  },
  {
    title: "Gift System",
    description: "Random event-based player rewards.",
    status: "Planned",
  },
  {
    title: "Player Profile",
    description: "Track stats: history, win rate, rank.",
    status: "Planned",
  },
  {
    title: "Leaderboards",
    description: "Global and friends rankings.",
    status: "Planned",
  },
  {
    title: "Achievements",
    description: "Unlock rewards for milestones and tasks.",
    status: "Planned",
  },
];

const statusColors = {
  Completed: 'bg-green-500',
  'In Progress': 'bg-yellow-500',
  Planned: 'bg-gray-500',
};

interface RoadmapScreenProps {
  onBack: () => void;
}

export default function RoadmapScreen({ onBack }: RoadmapScreenProps) {
  return (
    <div className="bg-gray-800 h-screen text-white w-full flex flex-col">
      <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <div className="flex flex-row items-center">
              <img src="/back-arrow.svg" alt="Back" className="w-6 h-6" />
              <span className="ml-2">Back</span>
            </div>
          </button>
        </div>
      </div>

      <main className="p-4 flex-grow overflow-y-auto scrollbar-hide">
        <h1 className="text-4xl font-bold text-center mb-8">Roadmap</h1>
        <div className="space-y-4">
          {roadmapItems.map((item, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{item.title}</h2>
                <span className={`px-2 py-1 text-sm rounded-full ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
