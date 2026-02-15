import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { IoArrowForwardCircle } from "react-icons/io5";
import {
  loadTypingRaceGuestProgress,
  saveTypingRaceGuestProgress,
} from "../lib/typingRaceGuestProgress";

const TypingRaceBot = ({ onNextLevel, minAccuracy = 90 }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const { levelId } = useParams();
  const [currentLevel, setCurrentLevel] = useState(Number(levelId) || 1);

  const [targetText, setTargetText] = useState("");
  const [botWPM, setBotWPM] = useState(30);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const keyCorrectSoundRef = useRef(null);
  const keyErrorSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const loseSoundRef = useRef(null);

  const hiddenInputRef = useRef(null);

  useEffect(() => {
    setCurrentLevel(Number(levelId) || 1);
  }, [levelId]);

  useEffect(() => {
    keyCorrectSoundRef.current = new Audio("/sounds/key-correct.wav");
    keyErrorSoundRef.current = new Audio("/sounds/key-error.wav");
    winSoundRef.current = new Audio("/sounds/correct.wav");
    loseSoundRef.current = new Audio("/sounds/wrong.wav");

    keyCorrectSoundRef.current.load();
    keyErrorSoundRef.current.load();
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
      console.error("play sound error", e);
    }
  };

  useEffect(() => {
    const fetchLevel = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `${API_BASE}/api/typing-race/level/${currentLevel}`,
        );

        if (!res.ok) throw new Error("โหลดข้อมูลด่านไม่สำเร็จ");
        const data = await res.json();
        setTargetText(data.text || "");
        setBotWPM(data.bot_wpm || 30);
      } catch (e) {
        setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchLevel();
    handleRestart();
  }, [currentLevel]);

  const [typedText, setTypedText] = useState("");
  const [botIndex, setBotIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);

  const userIndex = typedText.length;

  const botIntervalTime = useMemo(() => {
    const charsPerSecond = (botWPM * 5) / 60;
    return 1000 / charsPerSecond;
  }, [botWPM]);

  useEffect(() => {
    if (gameStarted && !winner) {
      const botTimer = setInterval(() => {
        setBotIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= targetText.length) {
            clearInterval(botTimer);
            if (!winner) {
              setWinner("bot");
              playSound(loseSoundRef);
            }
            return targetText.length;
          }
          return nextIndex;
        });
      }, botIntervalTime);

      return () => clearInterval(botTimer);
    }
  }, [gameStarted, winner, botIntervalTime, targetText.length]);

  const correctChars = typedText
    .split("")
    .filter((char, index) => char === targetText[index]).length;
  const totalChars = typedText.length;
  const accuracy =
    totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

  useEffect(() => {
    if (userIndex === targetText.length && !winner) {
      if (accuracy >= minAccuracy) {
        setWinner("user");
        playSound(winSoundRef);
      }
    }
  }, [userIndex, targetText.length, accuracy, winner, minAccuracy]);

  const handleUserType = (e) => {
    if (winner) return;

    const newText = e.target.value;
    const prevLength = typedText.length;

    if (newText.length > prevLength) {
      const newCharIndex = prevLength;
      const typedChar = newText[newCharIndex];
      const expectedChar = targetText[newCharIndex];

      if (typedChar === expectedChar) {
        playSound(keyCorrectSoundRef);
      } else {
        playSound(keyErrorSoundRef);
      }
    }

    setTypedText(newText);
    if (!gameStarted) setGameStarted(true);
  };

  const handleRestart = () => {
    setTypedText("");
    setBotIndex(0);
    setGameStarted(false);
    setWinner(null);
  };

  const handleNextLevel = async () => {
    const next = currentLevel + 1;

    if (winner === "user") {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          await fetch(`${API_BASE}/api/typing-race/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              level: currentLevel,
              accuracy,
              winner: "user",
            }),
          });
        } catch (err) {
          console.error("save progress error", err);
        }
      } else {
        const gp = loadTypingRaceGuestProgress();
        const maxCompleted = Math.max(gp.maxCompleted || 0, currentLevel);
        saveTypingRaceGuestProgress(maxCompleted);
      }
    }

    setCurrentLevel(next);
    if (onNextLevel) onNextLevel(next);
  };

  const handleTextClick = () => {
    if (!winner) {
      hiddenInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!winner && !loading) {
      hiddenInputRef.current?.focus();
    }
  }, [winner, loading]);

  const renderCharacter = (char, index) => {
    const isTyped = index < userIndex;
    const isBotHere = index === botIndex;
    const isUserHere = index === userIndex;

    let charClass = "text-gray-400 transition-colors duration-150";
    let bgClass = "";

    if (isTyped) {
      if (typedText[index] === char) {
        charClass = "text-emerald-600 font-semibold";
      } else {
        charClass = "text-rose-600 font-semibold";
        bgClass = "bg-rose-100/80 rounded-sm px-0.5";
      }
    }

    let cursorStyle = {};
    if (!winner) {
      if (isUserHere && isBotHere) {
        cursorStyle = {
          borderLeft: "3px solid #a855f7",
          animation: "pulse 1s ease-in-out infinite",
        };
      } else if (isUserHere) {
        cursorStyle = {
          borderLeft: "3px solid #3b82f6",
          animation: "pulse 1s ease-in-out infinite",
        };
      } else if (isBotHere) {
        cursorStyle = {
          borderLeft: "3px solid #f97316",
          animation: "pulse 1s ease-in-out infinite",
        };
      }
    }

    return (
      <span
        key={index}
        className={`${charClass} ${bgClass} inline-block`}
        style={cursorStyle}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    );
  };

  const showNeedAccuracyHint =
    !winner && userIndex === targetText.length && accuracy < minAccuracy;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลด่าน...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-600 text-xl font-semibold">
            เกิดข้อผิดพลาด: {err}
          </div>
        </div>
      </div>
    );
  }

  const userProgress = Math.round((userIndex / targetText.length) * 100);
  const botProgress = Math.round((botIndex / targetText.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="max-w-6xl mx-auto animate-slide-in">
        <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Level {currentLevel}
              </h1>
              <p className="text-gray-600 text-sm">
                พิมพ์ให้ถูกและเร็วเพื่อชนะ Bot
              </p>
            </div>
            <div className="flex gap-3">
              <div className="px-5 py-2.5 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl shadow-lg">
                <div className="text-xs opacity-90 mb-0.5">🤖 Bot Speed</div>
                <div className="text-xl font-bold">{botWPM} WPM</div>
              </div>
              <div className="px-5 py-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg">
                <div className="text-xs opacity-90 mb-0.5">👤 Accuracy</div>
                <div className="text-xl font-bold">{accuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl shadow-xl p-8 mb-6 relative">
          <div className="mb-6 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-blue-600 font-semibold">👤 You</span>
                <span className="text-blue-600 font-mono">{userProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${userProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-orange-600 font-semibold">🤖 Bot</span>
                <span className="text-orange-600 font-mono">
                  {botProgress}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${botProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div
            onClick={handleTextClick}
            className="text-2xl leading-relaxed tracking-wide p-6 bg-white rounded-xl cursor-text min-h-[200px] border-2 border-gray-200 hover:border-blue-300 transition-colors font-mono"
          >
            {targetText.split("").map(renderCharacter)}
          </div>

          <input
            ref={hiddenInputRef}
            type="text"
            value={typedText}
            onChange={handleUserType}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
                e.preventDefault();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="text"
            disabled={!!winner}
            maxLength={targetText.length}
            className="absolute opacity-0 pointer-events-none"
            autoFocus
          />

          {!gameStarted && !winner && (
            <div className="text-center mt-4 text-gray-500 text-sm">
              💡 คลิกในกล่องข้อความและเริ่มพิมพ์เพื่อเริ่มเกม
            </div>
          )}

          {showNeedAccuracyHint && (
            <div className="mt-4 text-center">
              <div className="inline-block bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 text-yellow-800 px-6 py-3 rounded-xl text-sm font-medium shadow-md">
                ⚠️ พิมพ์ครบแล้ว แต่ความแม่นยำต้องอย่างน้อย {minAccuracy}% —
                แก้คำที่ผิดก่อนที่บอทจะถึงเส้นชัย!
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-effect rounded-xl p-5 shadow-lg">
            <div className="text-sm text-gray-600 mb-2">
              👤 ความคืบหน้าของคุณ
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {userIndex}/{targetText.length}
            </div>
          </div>
          <div className="glass-effect rounded-xl p-5 shadow-lg">
            <div className="text-sm text-gray-600 mb-2">🤖 ความคืบหน้า Bot</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {botIndex}/{targetText.length}
            </div>
          </div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-6">
                {winner === "user" ? (
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    คุณชนะ!
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    คุณแพ้!
                  </span>
                )}
              </h2>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">ความแม่นยำ</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {accuracy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">พิมพ์ถูก</p>
                    <p className="text-3xl font-bold text-green-600">
                      {correctChars}/{totalChars}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-6">
                <button
                  onClick={handleRestart}
                  className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="เริ่มใหม่"
                >
                  <RotateCcw className="w-8 h-8 text-gray-700" />
                </button>

                <button
                  onClick={winner === "user" ? handleNextLevel : undefined}
                  disabled={winner !== "user"}
                  className="p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="ด่านถัดไป"
                  style={{
                    background:
                      winner === "user"
                        ? "linear-gradient(to bottom right, #10b981, #059669)"
                        : "linear-gradient(to bottom right, #e5e7eb, #d1d5db)",
                  }}
                >
                  <IoArrowForwardCircle
                    className={`w-10 h-10 ${
                      winner === "user" ? "text-white" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingRaceBot;
