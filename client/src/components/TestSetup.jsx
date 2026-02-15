import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChevronDownIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const TestSetup = () => {
  const [time, setTime] = useState("1");
  const [difficulty, setDifficulty] = useState("easy");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const timeInSeconds = parseInt(time) * 60;
    navigate(`/typing-challenge/${difficulty}/${timeInSeconds}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* ===== Title ===== */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ตั้งค่าการทดสอบการพิมพ์
          </h1>

          {/* Centered underline */}
          <div className="flex justify-center mt-4">
            <div className="w-28 h-1 bg-[#2B8BE6]/70 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border-b-4 border-[#2B8BE6] rounded-xl shadow-md p-8 md:p-12">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-8"
          >
            <div className="w-full max-w-md">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                ระยะเวลา
              </label>

              <div className="relative">
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-4 pl-5 pr-12 bg-gray-50 border border-gray-300 rounded-full text-gray-700 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]
                  hover:border-[#2B8BE6] transition appearance-none"
                >
                  <option value="1">1 นาที</option>
                  <option value="3">3 นาที</option>
                  <option value="5">5 นาที</option>
                </select>

                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            <div className="w-full max-w-md">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                ระดับความยาก
              </label>

              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-4 pl-5 pr-12 bg-gray-50 border border-gray-300 rounded-full text-gray-700 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]
                  hover:border-[#2B8BE6] transition appearance-none"
                >
                  <option value="easy">ง่าย</option>
                  <option value="medium">ปานกลาง</option>
                  <option value="hard">ยาก</option>
                </select>

                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full max-w-md mt-4 py-4 bg-[#3ACD27] text-white text-lg font-semibold rounded-full shadow-md cursor-pointer
              hover:bg-[#2FB81F] hover:shadow-lg hover:-translate-y-0.5
              active:scale-95
              transition-all duration-200"
            >
              เริ่มทดสอบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestSetup;
