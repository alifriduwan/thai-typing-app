import { Link } from "react-router-dom";

function GameCard({ gameName, path, img }) {
  return (
    <div>
      <Link
        to={path}
        className="bg-white border-b-4 border-[#2B8BE6] rounded-xl shadow-md 
               flex flex-col items-center text-center p-6
               hover:shadow-xl hover:-translate-y-1 
               transition-all duration-300"
      >
        <img
          src={img}
          alt={gameName}
          className="w-28 h-28 object-contain mb-5"
        />

        <h3 className="text-lg font-bold text-gray-800 mb-2">{gameName}</h3>

        <span className="bg-[#3ACD27] text-white px-6 py-2 rounded-full hover:bg-[#2FB81F] transition font-semibold">
          เริ่มเล่น →
        </span>
      </Link>
    </div>
  );
}
export default GameCard;
