import { Link } from "react-router-dom";
import { Zap, Target } from "lucide-react";

const TestSummaryWithSuggestions = ({
  stats,
  mistakes,
  lessonMap,
  onRetry,
  isLoggedIn,
}) => {
  const { wpm, accuracy, correctChars, totalTypedChars } = stats;

  const getCharDisplay = (char) => {
    if (char === " ") return "ช่องว่าง (Space)";
    if (char === "\n") return "ขึ้นบรรทัดใหม่";
    if (char === "\t") return "Tab";
    if (char === "") return "ตัวอักษรพิเศษ";
    return char;
  };

  const sortedMistakes = Object.entries(mistakes || {}).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">ผลการทดสอบ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-2xl shadow-md p-6">
          <div className="flex justify-center mb-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="text-purple-500" size={28} />
            </div>
          </div>

          <p className="text-gray-500 tracking-wide">SPEED</p>
          <div className="w-16 h-0.5 bg-gray-200 mx-auto my-2"></div>

          <p className="text-4xl font-bold text-gray-800">{wpm} WPM</p>
        </div>

        <div className="bg-white border rounded-2xl shadow-md p-6">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="text-green-500" size={28} />
            </div>
          </div>

          <p className="text-gray-500 tracking-wide">ACCURACY</p>
          <div className="w-16 h-0.5 bg-gray-200 mx-auto my-2"></div>

          <p className="text-4xl font-bold text-gray-800">{accuracy}%</p>
        </div>
      </div>

      <p className="text-gray-500 mb-8">
        พิมพ์ถูกต้อง {correctChars} จาก {totalTypedChars} ตัวอักษร
      </p>

      {isLoggedIn && sortedMistakes.length > 0 && (
        <div className="bg-white border rounded-2xl shadow-md p-6 text-left mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            แนะนำการฝึกเพิ่มเติม
          </h3>

          <div className="space-y-3">
            {sortedMistakes.slice(0, 3).map(([char, count]) => {
              const lessons = lessonMap[char] || [];
              const displayChar = getCharDisplay(char);

              return (
                <div
                  key={char}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                >
                  <div className="font-medium text-gray-700">
                    พิมพ์ผิดบ่อย: <b>{displayChar}</b> ({count} ครั้ง)
                  </div>

                  {lessons.length > 0 ? (
                    <div className="flex gap-2">
                      {lessons.slice(0, 2).map((L) => (
                        <Link
                          key={L}
                          to={`/lessons/${L}`}
                          className="px-3 py-1.5 bg-[#2B8BE6] text-white rounded-lg text-sm hover:bg-[#2478C9] whitespace-nowrap"
                        >
                          บทเรียน {L}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">ไม่มีบทเรียน</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="bg-white border rounded-2xl shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            เข้าสู่ระบบเพื่อดูการวิเคราะห์ข้อผิดพลาดและคำแนะนำบทเรียน
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 bg-[#2B8BE6] text-white rounded-full  hover:bg-[#2478C9]"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              to="/signup"
              className="px-6 py-2 bg-[#3ACD27] text-white rounded-full hover:bg-[#2FB81F]"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={onRetry}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:rotate-180 duration-300"
          title="ลองอีกครั้ง"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <Link
          to="/typing-test"
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
          title="ตั้งค่า"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>

        <Link
          to="/"
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
          title="กลับหน้าหลัก"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4a2 2 0 01-2-2V12H9v7a2 2 0 01-2 2H3z"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default TestSummaryWithSuggestions;
