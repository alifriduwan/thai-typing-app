import HomeCard from "./HomeCard.jsx";

import lessonImg from "../assets/images/lesson.png";
import testImg from "../assets/images/test.png";
import gameImg from "../assets/images/game.png";

const Home = () => {
  const menuItems = [
    { text: "บทเรียนฝึกพิมพ์", to: "/lessons", img: lessonImg },
    { text: "ทดสอบการพิมพ์", to: "/typing-test", img: testImg },
    { text: "มินิเกมฝึกพิมพ์", to: "/minigames", img: gameImg },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ThaiTyping
          </h1>

          <div className="flex justify-center mt-4">
            <div className="w-28 h-1 bg-[#2B8BE6]/70 rounded-full"></div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {menuItems.map((item) => (
            <HomeCard
              key={item.to}
              buttonText={item.text}
              to={item.to}
              img={item.img}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
