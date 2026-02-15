import spellingImg from "../assets/images/spelling.png";
import raceImg from "../assets/images/race.png";
import fallImg from "../assets/images/fall.png";

import GameCard from "./GameCard";

const GameLobby = () => {
  const games = [
    {
      id: 1,
      name: "เลือกพิมพ์คำที่ถูกต้อง",
      slug: "spelling-quiz",
      img: spellingImg,
    },
    {
      id: 2,
      name: "แข่งพิมพ์ตามความเร็วที่กำหนด",
      slug: "typing-race",
      img: raceImg,
    },
    {
      id: 3,
      name: "พิมพ์คำที่ตกลงมา",
      slug: "typing-fall",
      img: fallImg,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            มินิเกมฝึกพิมพ์
          </h1>
          <div className="w-20 h-1 bg-[#2B8BE6]/70 mx-auto mt-3 rounded"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              gameName={game.name}
              path={`/minigames/${game.slug}/levels`}
              img={game.img}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
