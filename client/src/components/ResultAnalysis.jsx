import React from "react";

const ResultCircle = ({ value, unit, colorClass }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg border-4 ${colorClass}`}
    >
      <span className="text-4xl font-bold text-white">{value}</span>
      {unit && <span className="text-xl font-semibold text-white">{unit}</span>}
    </div>
  </div>
);

const ResultAnalysis = () => {
  const results = {
    speed: 35,
    accuracy: 98,
    mostFrequentError: "n",
    recommendedLesson: "บทเรียน n",
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <main className="container mx-auto px-4">
        <h1 className="text-center text-4xl font-bold text-gray-800 mb-8">
          "ผลการพิมพ์ของคุณเป็นอย่างไร?"
        </h1>

        <div className="bg-orange-200 p-8 md:p-12 rounded-2xl shadow-xl max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-10 md:gap-20 mb-8">
            <ResultCircle
              value={results.speed}
              unit="WPM"
              colorClass="bg-green-500 border-green-600"
            />
            <ResultCircle
              value={`${results.accuracy}%`}
              colorClass="bg-cyan-500 border-cyan-600"
            />
          </div>

          <div className="space-y-2 text-xl font-semibold text-gray-700">
            <p>
              คุณพิมพ์ตัวอักษร '
              <span className="text-red-500 font-bold">
                {results.mostFrequentError}
              </span>
              ' ผิดบ่อย!
            </p>
            <p>
              แนะนำให้ฝึกเพิ่มเติมในบทเรียน '
              <span className="font-bold">{results.recommendedLesson}</span>'
              เพื่อเพิ่มความแม่นยำ!
            </p>
            <p>กดปุ่มด้านล่างเพื่อเริ่มฝึกเลย!</p>
          </div>

          <div className="mt-10">
            <button className="bg-red-500 text-white font-bold py-3 px-12 rounded-lg text-xl shadow-md hover:bg-red-600 transition-colors transform hover:scale-105">
              เริ่มฝึกเลย!
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultAnalysis;
