import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThaiKeyboardLayout from "./ThaiKeyboardLayout";
import { getHandPosition } from "../config/handPositions";
import { saveGuestTypingProgress } from "../lib/guestProgressTyping";

// const API_BASE = "http://localhost:5000/api/typing";
const API_BASE = `${import.meta.env.VITE_API_URL}/api/typing`;

const LessonStepPage_1 = () => {
  const { lessonId, stepIndex } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("loading");
  const [rawChars, setRawChars] = useState([]);
  const [displayChars, setDisplayChars] = useState([]);
  const [hasHands, setHasHands] = useState(false);

  const [globalIndex, setGlobalIndex] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [instructionStep, setInstructionStep] = useState(0);
  const [instructionCharIndex, setInstructionCharIndex] = useState(0);
  const [lastKeystroke, setLastKeystroke] = useState(null);

  const [keyPressed, setKeyPressed] = useState(false);
  const lastPressedKey = useRef(null);

  const keyCorrectSoundRef = useRef(null);
  const enterSoundRef = useRef(null);
  const errorSoundRef = useRef(null);

  useEffect(() => {
    keyCorrectSoundRef.current = new Audio("/sounds/key-correct.wav");
    enterSoundRef.current = new Audio("/sounds/correct.wav");
    errorSoundRef.current = new Audio("/sounds/key-error.wav");

    keyCorrectSoundRef.current.load();
    enterSoundRef.current.load();
    errorSoundRef.current.load();
  }, []);

  const playSound = (soundRef) => {
    try {
      if (soundRef?.current) {
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  useEffect(() => {
    const loadLevel = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE}/level/${lessonId}/${stepIndex}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        if (data.error === "locked") {
          alert(
            `ด่านนี้ยังไม่ปลดล็อก (อนุญาตเฉพาะ global_index = ${data.allowed_global})`,
          );
          navigate(`/lessons/${lessonId}/steps/${data.allowed_level}`);
          return;
        }

        setRawChars(data.raw_chars || []);
        setDisplayChars(data.display_chars || []);
        setHasHands(data.has_hand_images);

        setGlobalIndex(data.global_index);

        setPhase("instruction");
        setCurrentIndex(0);
        setMistakes(0);
        setInstructionStep(0);
        setInstructionCharIndex(0);
      } catch (err) {
        console.error("Failed to load level:", err);
      }
    };

    loadLevel();
  }, [lessonId, stepIndex, navigate, API_BASE]);

  const images =
    hasHands && stepIndex !== "3"
      ? {
          left: `/hands/lesson-${lessonId}/level-${stepIndex}/left.png`,
          right: `/hands/lesson-${lessonId}/level-${stepIndex}/right.png`,
        }
      : { left: null, right: null };

  const handPosition = getHandPosition(Number(lessonId), Number(stepIndex));

  const getInstructionCharsCount = () => {
    const firstDisplay = displayChars[0] || "";
    return firstDisplay.length;
  };

  const instructionCharsCount = getInstructionCharsCount();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!rawChars.length) return;
      if (["Shift", "Control", "Alt"].includes(e.key)) return;

      if (keyPressed && e.key === lastPressedKey.current) {
        return;
      }

      setKeyPressed(true);
      lastPressedKey.current = e.key;

      if (phase === "instruction") {
        if (instructionStep === 0) {
          const targetChar = rawChars[instructionCharIndex];

          if (e.key === targetChar) {
            playSound(keyCorrectSoundRef);
            setLastKeystroke({ key: e.key, correct: true });

            if (instructionCharIndex + 1 < instructionCharsCount) {
              setInstructionCharIndex((prev) => prev + 1);
            } else {
              setInstructionStep(1);
              setInstructionCharIndex(0);
            }
          } else {
            playSound(errorSoundRef);
            setLastKeystroke({ key: e.key, correct: false });
          }
          return;
        }

        if (instructionStep === 1) {
          if (e.key === "Enter") {
            playSound(enterSoundRef);
            setPhase("practice");
            setStartTime(Date.now());
          } else {
            playSound(errorSoundRef);
            setLastKeystroke({ key: e.key, correct: false });
          }
        }
        return;
      }

      if (phase === "practice") {
        const target = rawChars[currentIndex];
        const correct = e.key === target;

        setLastKeystroke({ key: e.key, correct });

        if (correct) {
          playSound(keyCorrectSoundRef);

          if (currentIndex + 1 >= rawChars.length) {
            setEndTime(Date.now());
            setPhase("completed");
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        } else {
          playSound(errorSoundRef);
          setMistakes((prev) => prev + 1);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === lastPressedKey.current) {
        setKeyPressed(false);
        lastPressedKey.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    phase,
    rawChars,
    currentIndex,
    instructionStep,
    instructionCharIndex,
    instructionCharsCount,
    keyPressed,
  ]);

  const calcStats = () => {
    if (!startTime || !endTime) return { wpm: 0, accuracy: 0, stars: 0 };

    const minutes = (endTime - startTime) / 60000;
    const wpm = Math.round(rawChars.length / 5 / minutes);
    const accuracy = Math.round(
      ((rawChars.length - mistakes) / rawChars.length) * 100,
    );

    let stars = 1;
    if (accuracy > 90) stars = 2;
    if (accuracy === 100) stars = 3;

    return { wpm, accuracy, stars };
  };

  const stats = calcStats();

  const sendCompletion = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (token) {
        await fetch(`${API_BASE}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lesson_id: Number(lessonId),
            level_index: Number(stepIndex),
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            mistakes,
            stars: stats.stars,
          }),
        });
      }

      if (globalIndex !== null) {
        saveGuestTypingProgress(globalIndex + 1);
      }
    } catch (err) {
      console.error("Error saving completion:", err);

      if (globalIndex !== null) {
        saveGuestTypingProgress(globalIndex + 1);
      }
    }
  };

  useEffect(() => {
    if (phase === "completed") {
      sendCompletion();
    }
  }, [phase]);

  const totalSlots = displayChars.length;
  const lineSize = 8;

  const lines = [];
  for (let i = 0; i < totalSlots / lineSize; i++) {
    lines.push(displayChars.slice(i * lineSize, i * lineSize + lineSize));
  }

  const slotIndex = Math.floor(currentIndex / (stepIndex === "3" ? 2 : 1));

  const linesPerGroup = 2;
  const slotsPerGroup = lineSize * linesPerGroup;

  const currentGroup = Math.floor(slotIndex / slotsPerGroup);
  const visibleLines = lines.slice(
    currentGroup * linesPerGroup,
    currentGroup * linesPerGroup + linesPerGroup,
  );

  const getNextKey = () => {
    if (phase === "instruction") {
      if (instructionStep === 0) {
        return rawChars[instructionCharIndex];
      } else {
        return "Enter";
      }
    }
    return rawChars[currentIndex];
  };

  const showHands = hasHands && images.left && images.right;

  const HandKeyboardOverlay = ({ currentChar }) => (
    <div className="relative w-full flex justify-center items-center mt-6">
      <div className="opacity-60">
        <ThaiKeyboardLayout
          currentChar={currentChar}
          lastKeystroke={lastKeystroke}
        />
      </div>

      {showHands && (
        <div
          className={`absolute ${handPosition.containerTop} left-1/2 -translate-x-1/2 ${handPosition.containerLeft} flex ${handPosition.gap} pointer-events-none`}
        >
          <img
            src={images.left}
            className={`${handPosition.width} h-auto select-none ${handPosition.left}`}
            alt="Left hand"
          />
          <img
            src={images.right}
            className={`${handPosition.width} h-auto select-none ${handPosition.right}`}
            alt="Right hand"
          />
        </div>
      )}
    </div>
  );

  const isLastLesson = Number(stepIndex) === 3 && Number(lessonId) === 45;

  if (phase === "loading")
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#EEF4FF] flex justify-center py-8">
      <div className="w-full max-w-5xl bg-white border rounded-2xl shadow-sm">
        <div className="flex gap-2 border-b px-4 py-2 bg-blue-50">
          {[1, 2, 3].map((lvl) => (
            <div
              key={lvl}
              className={`px-6 py-2 rounded-t-xl font-semibold ${
                lvl === Number(stepIndex)
                  ? "bg-white border border-blue-300 border-b-0 text-blue-600"
                  : "text-blue-300"
              }`}
            >
              ระดับ {lvl}
            </div>
          ))}
        </div>

        {phase === "instruction" && (
          <div className="p-12 flex flex-col items-center gap-10">
            <h2 className="text-xl">
              กด <b className="text-blue-600">{displayChars[0]}</b> แล้วกด Enter
            </h2>

            <div className="flex items-center gap-6">
              <div
                className={`w-20 h-20 rounded-xl text-4xl flex items-center justify-center shadow ${
                  instructionStep >= 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {displayChars[0]}
              </div>

              <ArrowRight size={32} className="text-gray-400" />

              <div
                className={`px-6 py-4 rounded-lg text-lg font-bold border ${
                  instructionStep === 1
                    ? "bg-blue-100 text-blue-700 border-blue-500"
                    : "bg-white text-gray-400"
                }`}
              >
                ENTER ↵
              </div>
            </div>

            <HandKeyboardOverlay currentChar={getNextKey()} />
          </div>
        )}

        {phase === "practice" && (
          <div className="p-10 flex flex-col items-center gap-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGroup}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-6"
              >
                {visibleLines.map((line, row) => (
                  <div key={row} className="flex gap-6">
                    <div className="flex gap-3">
                      {line.slice(0, 4).map((text, idx) => {
                        const abs =
                          currentGroup * slotsPerGroup + row * lineSize + idx;

                        const done = abs < slotIndex;
                        const active = abs === slotIndex;

                        return (
                          <div
                            key={idx}
                            className={`w-16 h-16 rounded-xl text-3xl flex items-center justify-center border ${
                              done
                                ? "bg-green-100 text-green-700 border-green-300"
                                : active
                                  ? "bg-blue-500 text-white shadow-md scale-105"
                                  : "bg-white text-gray-800 border-gray-300"
                            }`}
                          >
                            {text}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-10" />

                    <div className="flex gap-3">
                      {line.slice(4, 8).map((text, idx) => {
                        const abs =
                          currentGroup * slotsPerGroup +
                          row * lineSize +
                          idx +
                          4;

                        const done = abs < slotIndex;
                        const active = abs === slotIndex;

                        return (
                          <div
                            key={idx}
                            className={`w-16 h-16 rounded-xl text-3xl flex items-center justify-center border ${
                              done
                                ? "bg-green-100 text-green-700 border-green-300"
                                : active
                                  ? "bg-blue-500 text-white shadow-md scale-105"
                                  : "bg-white text-gray-800 border-gray-300"
                            }`}
                          >
                            {text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <HandKeyboardOverlay currentChar={getNextKey()} />
          </div>
        )}

        {phase === "completed" && (
          <div className="p-12 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6">
              {isLastLesson ? "ยินดีด้วย! คุณจบทุกบทเรียนแล้ว" : "เสร็จสิ้น"}
            </h2>

            <div className="flex gap-3 mb-6">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={64}
                  fill={s <= stats.stars ? "#FBBF24" : "#E5E7EB"}
                />
              ))}
            </div>

            <p className="text-lg mb-2">
              ความเร็ว: <b>{stats.wpm}</b> WPM
            </p>

            <p className="text-lg mb-6">
              ความแม่นยำ: <b>{stats.accuracy}%</b>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition"
              >
                ทำอีกครั้ง
              </button>

              {!isLastLesson && (
                <button
                  onClick={() => {
                    const lv = Number(stepIndex);
                    const ls = Number(lessonId);

                    if (lv < 3) {
                      navigate(`/lessons/${ls}/steps/${lv + 1}`);
                    } else {
                      navigate(`/lessons/${ls + 1}/steps/1`);
                    }
                  }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition"
                >
                  ดำเนินการต่อ
                </button>
              )}

              {isLastLesson && (
                <>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
                  >
                    กลับหน้าหลัก
                  </button>

                  <button
                    onClick={() => navigate("/user-profile")}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition"
                  >
                    โปรไฟล์ของฉัน
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonStepPage_1;
