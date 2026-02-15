import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RotateCcw, ArrowRight } from "lucide-react";
import { saveGuestProgressFall } from "../lib/guestProgressFall";

const DEFAULT_TIME_LIMIT = 30;

const TypingFallGame = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const level = Math.max(1, parseInt(levelId || "1", 10));

  const token = localStorage.getItem("access_token");
  const isLoggedIn = !!token;

  const [config, setConfig] = useState({
    level,
    fall_speed: 8,
    spawn_interval_ms: 1500,
    max_concurrent: 1,
    target_words: 5,
    word_pool: ["เวลา", "ความคิด", "สร้างสรรค์", "อิทธิพล"],
  });

  const [activeWord, setActiveWord] = useState(null);
  const [nextWord, setNextWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [wordsTyped, setWordsTyped] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeWhenWon, setTimeWhenWon] = useState(null);

  const inputRef = useRef(null);
  const animKey = useRef(0);
  const postedRef = useRef(false);

  const keyTypeSoundRef = useRef(null);
  const correctWordSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const loseSoundRef = useRef(null);

  useEffect(() => {
    keyTypeSoundRef.current = new Audio("/sounds/key-correct.wav");
    correctWordSoundRef.current = new Audio("/sounds/correct.wav");
    winSoundRef.current = new Audio("/sounds/correct.wav");
    loseSoundRef.current = new Audio("/sounds/wrong.wav");

    keyTypeSoundRef.current.load();
    correctWordSoundRef.current.load();
    winSoundRef.current.load();
    loseSoundRef.current.load();
  }, []);

  const playSound = (soundRef) => {
    try {
      if (soundRef?.current) {
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error("playSound error:", e);
    }
  };

  useEffect(() => {
    let aborted = false;

    const loadLevel = async () => {
      try {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const r = await fetch(`/api/typing_fall/level/${level}`, { headers });

        if (r.status === 403) {
          const j = await r.json().catch(() => ({}));
          if (j?.allowed_next) {
            navigate(`/minigames/typing-fall/${j.allowed_next}`, {
              replace: true,
            });
            return;
          }
        }
        if (!r.ok) throw new Error("โหลดเลเวลไม่สำเร็จ");

        const j = await r.json();
        if (aborted) return;

        setConfig({
          level: j.level,
          fall_speed: Number(j.fall_speed) || 8,
          spawn_interval_ms: Number(j.spawn_interval_ms) || 1500,
          max_concurrent: Number(j.max_concurrent) || 1,
          target_words: Number(j.target_words) || 5,
          word_pool:
            Array.isArray(j.word_pool) && j.word_pool.length
              ? j.word_pool
              : ["เวลา", "ความคิด", "สร้างสรรค์", "อิทธิพล"],
        });

        setActiveWord(null);
        setNextWord("");
        setInputValue("");
        setWordsTyped(0);
        setWpm(0);
        setTimeLeft(DEFAULT_TIME_LIMIT);
        setGameOver(false);
        setGameWon(false);
        setTimeWhenWon(null);
        animKey.current = 0;
        postedRef.current = false;

        setTimeout(() => {
          spawnNewWord(j.word_pool);
          inputRef.current?.focus();
        }, 50);
      } catch (e) {
        console.error(e);
      }
    };

    loadLevel();
    return () => {
      aborted = true;
    };
  }, [level, token, navigate]);

  const spawnNewWord = (pool) => {
    const list = pool && pool.length ? pool : config.word_pool;
    const avail = list.filter((w) => w !== activeWord?.text && w !== nextWord);
    const base = avail.length ? avail : list;
    const newText = base[Math.floor(Math.random() * base.length)];
    setActiveWord({ text: nextWord || newText });
    setNextWord(list[Math.floor(Math.random() * list.length)]);
    animKey.current += 1;
  };

  useEffect(() => {
    if (gameOver || gameWon) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          if (!gameWon) {
            setGameOver(true);
            playSound(loseSoundRef);
          }
          return 0;
        }
        if (prev % 5 === 0) {
          const elapsedMin = (DEFAULT_TIME_LIMIT - prev + 1) / 60;
          setWpm(Math.round(wordsTyped / (elapsedMin || 1e-9)));
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameOver, gameWon, wordsTyped]);

  useEffect(() => {
    if (!activeWord || gameWon) return;
    if (inputValue === activeWord.text) {
      playSound(correctWordSoundRef);

      setWordsTyped((w) => w + 1);
      setInputValue("");

      if (wordsTyped + 1 >= config.target_words) {
        setTimeWhenWon(timeLeft);
        setGameWon(true);
        playSound(winSoundRef);
      } else {
        spawnNewWord();
      }
    }
  }, [inputValue, activeWord, gameWon]);

  const handleAnimationEnd = () => {
    if (activeWord && inputValue !== activeWord.text && !gameWon) {
      setGameOver(true);
      playSound(loseSoundRef);
    }
  };

  useEffect(() => {
    const postOnce = async () => {
      if (!gameWon || postedRef.current) return;
      postedRef.current = true;

      try {
        if (isLoggedIn) {
          const res = await fetch("/api/typing_fall/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ level, correct: true }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || res.statusText);
          }
        } else {
          saveGuestProgressFall(level);
        }
      } catch (e) {
        console.error("update typing-fall progress failed:", e);
      }
    };
    postOnce();
  }, [gameWon, isLoggedIn, token, level]);

  const resetGame = () => {
    setActiveWord(null);
    setNextWord("");
    setInputValue("");
    setWordsTyped(0);
    setWpm(0);
    setTimeLeft(DEFAULT_TIME_LIMIT);
    setGameOver(false);
    setGameWon(false);
    setTimeWhenWon(null);
    animKey.current = 0;
    postedRef.current = false;
    setTimeout(() => {
      spawnNewWord();
      inputRef.current?.focus();
    }, 50);
  };

  const goNext = () =>
    navigate(`/minigames/typing-fall/${level + 1}`, { replace: true });

  const animDuration = useMemo(
    () => `${Number(config.fall_speed) || 8}s`,
    [config.fall_speed],
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;

    if (newValue.length > inputValue.length) {
      playSound(keyTypeSoundRef);
    }

    setInputValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <style>{`
        @keyframes fallTF {
          0%   { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(70vh); }
        }
        .animate-fall-tf {
          animation-name: fallTF;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-6">
        <div className="flex flex-col gap-4">
          <StatBox label="Level" value={level} />
          <StatBox label="WPM" value={wpm} />
          <StatBox
            label="Progress"
            value={`${wordsTyped}/${config.target_words}`}
          />
          <StatBox
            label="Progress %"
            value={`${Math.round((wordsTyped / config.target_words) * 100)}%`}
          />
        </div>

        <div className="relative bg-white rounded-2xl shadow-lg border h-[70vh] flex flex-col justify-end p-6 overflow-hidden">
          <div className="absolute top-4 left-6 right-6 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2B8BE6] h-full rounded-full transition-all duration-300"
              style={{ width: `${(wordsTyped / config.target_words) * 100}%` }}
            />
          </div>

          {!gameOver && !gameWon && activeWord && (
            <div
              key={animKey.current}
              className="absolute top-0 left-1/2 animate-fall-tf"
              style={{ animationDuration: animDuration }}
              onAnimationEnd={handleAnimationEnd}
            >
              <span className="text-3xl font-bold bg-white px-6 py-2 rounded-xl shadow-lg border">
                {activeWord.text}
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={gameOver || gameWon}
            className="w-full max-w-md mx-auto p-4 text-center text-2xl rounded-xl border-2 border-gray-300 focus:border-[#2B8BE6] outline-none disabled:bg-gray-100"
            placeholder="พิมพ์คำที่นี่..."
          />

          {gameWon && (
            <Overlay>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                ชนะแล้ว!
              </h2>
              <p className="text-xl mb-2">
                คุณพิมพ์ครบ {config.target_words} คำแล้ว!
              </p>
              <p className="text-lg mb-6">
                เวลาที่เหลือ: {timeWhenWon ?? timeLeft} วินาที
              </p>

              <div className="flex gap-6 justify-center">
                <IconBtn onClick={resetGame}>
                  <RotateCcw />
                </IconBtn>
                <IconBtn onClick={goNext} primary>
                  <ArrowRight />
                </IconBtn>
              </div>
            </Overlay>
          )}

          {gameOver && !gameWon && (
            <Overlay>
              <h2 className="text-3xl font-bold text-red-600 mb-4">
                Game Over
              </h2>
              <p className="text-lg mb-2">
                พิมพ์ได้: {wordsTyped}/{config.target_words} คำ
              </p>
              <p className="text-base mb-6">เวลาหมด หรือ คำตกถึงพื้น!</p>

              <button
                onClick={resetGame}
                className="px-8 py-3 bg-[#2B8BE6] text-white rounded-lg hover:bg-[#2478C9] font-bold"
              >
                เล่นอีกครั้ง
              </button>
            </Overlay>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <StatBox label="Next" value={nextWord || "-"} />
          <StatBox
            label="Time"
            value={`0:${timeLeft < 10 ? "0" : ""}${timeLeft}`}
            isWarning={timeLeft <= 10}
          />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, isWarning = false }) => (
  <div
    className={`bg-white border shadow rounded-2xl p-4 text-center ${
      isWarning ? "border-red-500" : ""
    }`}
  >
    <div
      className={`text-xl font-bold ${
        isWarning ? "text-red-600" : "text-gray-800"
      }`}
    >
      {value}
    </div>
    <div className="text-xs text-gray-500 uppercase">{label}</div>
  </div>
);

const Overlay = ({ children }) => (
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-10">
    <div className="bg-white rounded-2xl shadow-xl p-10 text-center w-[400px]">
      {children}
    </div>
  </div>
);

const IconBtn = ({ children, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full ${
      primary
        ? "bg-[#2B8BE6] text-white hover:bg-[#2478C9]"
        : "bg-gray-100 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

export default TypingFallGame;
