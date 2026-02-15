import { Link } from "react-router-dom";

function HomeCard({ buttonText, to, img }) {
  return (
    <Link
      to={to}
      className="group bg-white border-t-4 border-b-4 border-[#2B8BE6] rounded-xl shadow-md p-6 
      flex flex-col items-center text-center 
      hover:shadow-xl hover:-translate-y-1 
      transition-all duration-300 
      cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
    >
      <img
        src={img}
        alt={buttonText}
        className="w-40 h-40 object-contain mb-6"
      />

      <span
        className="bg-[#3ACD27] text-white px-6 py-2 rounded-full 
        font-semibold transition 
        group-hover:bg-[#2FB81F]"
      >
        {buttonText}
      </span>
    </Link>
  );
}
export default HomeCard;
