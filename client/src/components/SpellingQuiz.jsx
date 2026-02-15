import React, { useState, useEffect, useRef } from "react";
import { IoReload, IoArrowForwardCircle } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import { loadGuestProgress, saveGuestProgress } from "../lib/guestProgress";

const DEFAULT_QUESTION = "เลือกพิมพ์คำที่ถูกต้อง";

function getOptionClasses(option, isSubmitted, correctWord) {
  const base =
    "flex items-center justify-center w-56 h-28 rounded-xl border font-semibold text-2xl transition-all duration-200";

  if (!isSubmitted)
    return `${base} bg-white border-gray-200 hover:shadow-md hover:-translate-y-1`;

  if (option === correctWord)
    return `${base} bg-green-50 border-green-500 text-green-700 shadow-md scale-105`;

  return `${base} bg-red-50 border-red-300 text-red-600 opacity-80`;
}

const SpellingQuiz = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const level = Math.max(1, parseInt(levelId || "1", 10));

  const token = localStorage.getItem("access_token");
  const isLoggedIn = !!token;

  const [loadingState, setLoadingState] = useState(true);
  const [allowedNext, setAllowedNext] = useState(1);

  const [loadingLevel, setLoadingLevel] = useState(true);
  const [levelData, setLevelData] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const keyTypeSoundRef = useRef(null);
  const correctAnswerSoundRef = useRef(null);
  const wrongAnswerSoundRef = useRef(null);

  useEffect(() => {
    keyTypeSoundRef.current = new Audio("/sounds/key-correct.wav");
    correctAnswerSoundRef.current = new Audio("/sounds/correct.wav");
    wrongAnswerSoundRef.current = new Audio("/sounds/wrong.wav");

    keyTypeSoundRef.current.load();
    correctAnswerSoundRef.current.load();
    wrongAnswerSoundRef.current.load();
  }, []);

  const playSound = (ref) => {
    try {
      if (ref?.current) {
        ref.current.currentTime = 0;
        ref.current.play().catch(() => {});
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  useEffect(() => {
    const fetchState = async () => {
      setLoadingState(true);
      try {
        if (isLoggedIn) {
          const res = await fetch("/api/spelling/state", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const j = await res.json();
            setAllowedNext(j?.next_level || 1);
          } else {
            const gp = loadGuestProgress();
            setAllowedNext(gp.maxCompleted + 1);
          }
        } else {
          const gp = loadGuestProgress();
          setAllowedNext(gp.maxCompleted + 1);
        }
      } finally {
        setLoadingState(false);
      }
    };

    fetchState();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!loadingState && level > allowedNext) {
      navigate(`/minigames/spelling-quiz/${allowedNext}`, { replace: true });
    }
  }, [loadingState, level, allowedNext, navigate]);

  useEffect(() => {
    const fetchLevel = async () => {
      setLoadingLevel(true);
      setIsSubmitted(false);
      setInputValue("");

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let res = await fetch(`/api/spelling/level/${level}`, { headers });

        if (res.status === 401) {
          localStorage.removeItem("access_token");
          res = await fetch(`/api/spelling/level/${level}`);
        }

        if (!res.ok) throw new Error();

        const j = await res.json();
        setLevelData(j);
        setShuffledOptions(j.options.slice().sort(() => Math.random() - 0.5));
      } catch {
        setLevelData(null);
      } finally {
        setLoadingLevel(false);
      }
    };

    fetchLevel();
  }, [level, token]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;

    if (newVal.length > inputValue.length) {
      playSound(keyTypeSoundRef);
    }

    setInputValue(newVal);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    const correct = levelData && inputValue.trim() === levelData.correctWord;

    playSound(correct ? correctAnswerSoundRef : wrongAnswerSoundRef);
  };

  const handleRetry = () => {
    setInputValue("");
    setIsSubmitted(false);
    setShuffledOptions(
      levelData.options.slice().sort(() => Math.random() - 0.5),
    );
  };

  const isUserCorrect =
    levelData && isSubmitted && inputValue.trim() === levelData.correctWord;

  const handleNextLevel = async () => {
    if (!isUserCorrect) return;

    const next = level + 1;

    if (isLoggedIn) {
      await fetch("/api/spelling/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ level, correct: true }),
      });
    } else {
      const gp = loadGuestProgress();
      saveGuestProgress(Math.max(gp.maxCompleted || 0, level));
    }

    setAllowedNext((prev) => Math.max(prev, next));
    navigate(`/minigames/spelling-quiz/${next}`, { replace: true });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) handleSubmit();
  };

  if (loadingLevel || !levelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-gray-600">
          กำลังโหลดเลเวล...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Level {level}</h1>
          <p className="text-gray-600 mt-2">{DEFAULT_QUESTION}</p>
          <div className="w-20 h-1 bg-[#2B8BE6]/70 mx-auto mt-3 rounded"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {shuffledOptions.map((option, idx) => (
              <div
                key={idx}
                className={getOptionClasses(
                  option,
                  isSubmitted,
                  levelData.correctWord,
                )}
              >
                {option}
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="พิมพ์คำตอบของคุณ"
              disabled={isSubmitted}
              className="w-full text-center text-xl py-3 border-b-2 border-gray-300 focus:outline-none focus:border-[#2B8BE6] transition disabled:opacity-50"
            />
          </div>

          {isSubmitted && (
            <div className="text-center mb-6">
              {isUserCorrect ? (
                <p className="text-green-600 text-xl font-bold">ถูกต้อง!</p>
              ) : (
                <p className="text-red-600 text-xl font-bold">
                  ยังไม่ถูก ลองใหม่อีกครั้ง
                </p>
              )}
            </div>
          )}

          {isSubmitted && (
            <div className="flex justify-center items-center gap-6 mt-4">
              <button
                onClick={handleRetry}
                className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:rotate-180 duration-300"
                title="ลองอีกครั้ง"
              >
                <IoReload className="text-gray-600 text-2xl" />
              </button>

              <button
                onClick={isUserCorrect ? handleNextLevel : undefined}
                disabled={!isUserCorrect}
                className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="ด่านถัดไป"
              >
                <IoArrowForwardCircle
                  className={`text-3xl ${
                    isUserCorrect ? "text-[#3ACD27]" : "text-gray-300"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellingQuiz;
