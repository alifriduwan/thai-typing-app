import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import { analyzeMistakes } from "../utils/analyzeMistakes";
import { fetchLessonCharMap } from "../api/lessonMapping";

import TestSummaryWithSuggestions from "./TestSummaryWithSuggestions";

const LEVEL_STYLES = {
  easy: { name: "ง่าย", classes: "bg-green-500 text-white" },
  medium: { name: "ปานกลาง", classes: "bg-yellow-500 text-white" },
  hard: { name: "ยาก", classes: "bg-red-500 text-white" },
};

const CHARS_PER_LINE = 65;
const LINES_PER_PAGE = 3;

const wordWrapText = (text, maxCharsPerLine) => {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const w of words) {
    if (!line.length) line = w;
    else if (line.length + 1 + w.length <= maxCharsPerLine) line += " " + w;
    else {
      lines.push(line);
      line = w;
    }
  }

  if (line.length) lines.push(line);
  return lines;
};

const TypingChallenge = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const { level: paramLevel, time: paramTime } = useParams();
  const level = (paramLevel || "medium").toLowerCase();
  const time = parseInt(paramTime, 10) || 60;

  const [timeLeft, setTimeLeft] = useState(time);
  const [typedText, setTypedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [targetText, setTargetText] = useState("");
  const [textId, setTextId] = useState(null);

  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    totalTypedChars: 0,
  });

  const [loadingText, setLoadingText] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [textLines, setTextLines] = useState([]);
  const [lineStartIndices, setLineStartIndices] = useState([0]);
  const [currentPage, setCurrentPage] = useState(0);

  const inputRef = useRef(null);

  const correctSoundRef = useRef(null);
  const errorSoundRef = useRef(null);

  const [mistakes, setMistakes] = useState({});
  const [lessonMap, setLessonMap] = useState({});

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    correctSoundRef.current = new Audio("/sounds/key-correct.wav");
    errorSoundRef.current = new Audio("/sounds/key-error.wav");
    correctSoundRef.current.load();
    errorSoundRef.current.load();

    const t = localStorage.getItem("access_token");
    setIsLoggedIn(!!t);
  }, []);

  const playSound = (isCorrect) => {
    try {
      const sound = isCorrect ? correctSoundRef.current : errorSoundRef.current;
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  const resetCore = () => {
    setTimeLeft(time);
    setTypedText("");
    setIsFinished(false);
    setHasStarted(false);

    setStats({ wpm: 0, accuracy: 0, correctChars: 0, totalTypedChars: 0 });

    setMistakes({});

    setCurrentPage(0);
    inputRef.current?.focus();
  };

  const fetchText = async () => {
    setLoadingText(true);
    setLoadErr("");

    try {
      const res = await fetch(
        `${API_BASE}/api/typing_text/random?level=${encodeURIComponent(level)}&time=${time}`,
      );

      const data = await res.json();

      if (!res.ok || !data?.text) throw new Error(data?.error || "ไม่พบบทความ");

      const original = String(data.text);
      const wrapped = wordWrapText(original, CHARS_PER_LINE);

      const indices = [0];
      for (let i = 0; i < wrapped.length - 1; i++) {
        indices.push(indices[i] + wrapped[i].length + 1);
      }

      setTargetText(wrapped.join(" "));
      setTextLines(wrapped);
      setLineStartIndices(indices);
      setTextId(data.id || null);

      resetCore();
    } catch (err) {
      setLoadErr(err.message);

      const fallback = "ไม่สามารถโหลดบทความได้ โปรดลองใหม่";
      const w = wordWrapText(fallback, CHARS_PER_LINE);

      setTargetText(w.join(" "));
      setTextLines(w);
      setLineStartIndices([0]);
      setTextId(null);

      resetCore();
    } finally {
      setLoadingText(false);
    }
  };

  useEffect(() => {
    fetchLessonCharMap().then(setLessonMap);
  }, []);

  useEffect(() => {
    fetchText();
  }, [level, time]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setIsFinished(true);
    }
  }, [timeLeft, hasStarted, isFinished]);

  useEffect(() => {
    if (!isFinished) return;

    const total = typedText.length;
    if (!total) return;

    let correct = 0;
    typedText.split("").forEach((c, i) => {
      if (c === targetText[i]) correct++;
    });

    const errorInfo = analyzeMistakes(typedText, targetText);
    setMistakes(errorInfo);

    const accuracy = Math.round((correct / total) * 100);
    const elapsedMin = (time - timeLeft) / 60;

    const wpm = elapsedMin > 0 ? Math.round(correct / 5 / elapsedMin) : 0;

    setStats({
      wpm,
      accuracy,
      correctChars: correct,
      totalTypedChars: total,
    });

    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_BASE}/api/typing_test/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          time_sec: time,
          text_id: textId,
          wpm,
          accuracy,
          correct_chars: correct,
          total_chars: total,
        }),
      }).catch(() => {});
    }
  }, [isFinished]);

  const handleInputChange = (e) => {
    if (isFinished || loadingText) return;

    const val = e.target.value;
    const prevLength = typedText.length;

    if (!hasStarted) setHasStarted(true);

    if (val.length > prevLength) {
      const newCharIndex = prevLength;
      const typedChar = val[newCharIndex];
      const expectedChar = targetText[newCharIndex];

      playSound(typedChar === expectedChar);
    }

    setTypedText(val);

    const nextPage = currentPage + 1;
    const nextLineIndex = nextPage * LINES_PER_PAGE;

    if (nextLineIndex < lineStartIndices.length) {
      const triggerIndex = lineStartIndices[nextLineIndex];
      if (val.length >= triggerIndex) setCurrentPage(nextPage);
    }

    if (val.length === targetText.length) setIsFinished(true);
  };

  const prevent = (e) => e.preventDefault();
  const levelInfo = LEVEL_STYLES[level] || LEVEL_STYLES.medium;

  const startIdx = currentPage * LINES_PER_PAGE;
  const endIdx = startIdx + LINES_PER_PAGE;
  const visibleLines = textLines.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-10 pb-10 px-4">
      <div className="w-full max-w-5xl mx-auto">
        {isFinished ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <TestSummaryWithSuggestions
              stats={stats}
              mistakes={mistakes}
              lessonMap={lessonMap}
              onRetry={fetchText}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-7xl font-bold text-gray-300 tracking-tight">
                {timeLeft}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${levelInfo.classes}`}
                >
                  ระดับ: {levelInfo.name}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchText}
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:rotate-180 duration-300"
                  title="รีเซ็ต"
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
                  title="ปิด"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {loadingText && (
              <div className="p-6 bg-white rounded-2xl shadow-lg text-gray-600 text-center">
                กำลังโหลดบทความ...
              </div>
            )}

            {loadErr && (
              <div className="p-6 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-2xl mb-4 text-center">
                {loadErr}
              </div>
            )}

            {!loadingText && (
              <div
                className="bg-white rounded-2xl shadow-2xl p-12 cursor-text select-none min-h-[240px]"
                onClick={() => inputRef.current?.focus()}
                onCopy={prevent}
                onCut={prevent}
                onDrop={prevent}
                onContextMenu={prevent}
                draggable={false}
              >
                <div className="text-2xl leading-relaxed tracking-wide font-mono">
                  {visibleLines.map((line, idx) => {
                    const lineIndex = startIdx + idx;
                    const lineStart = lineStartIndices[lineIndex];

                    return (
                      <div key={idx} className="mb-4">
                        {line.split("").map((char, i) => {
                          const globalIndex = lineStart + i;

                          let colorClass = "text-gray-300";
                          let bgClass = "";

                          if (globalIndex < typedText.length) {
                            if (typedText[globalIndex] === char) {
                              colorClass = "text-gray-700";
                            } else {
                              colorClass = "text-red-500";
                              bgClass = "bg-red-100";
                            }
                          }

                          const isCurrent =
                            globalIndex === typedText.length && !isFinished;

                          return (
                            <span
                              key={globalIndex}
                              className={`${colorClass} ${bgClass} ${
                                isCurrent
                                  ? "border-l-4 border-blue-500 animate-pulse"
                                  : ""
                              } transition-colors duration-100`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <input
          type="text"
          ref={inputRef}
          className="absolute -left-full"
          value={typedText}
          onChange={handleInputChange}
          maxLength={targetText.length}
          disabled={isFinished || loadingText}
          onPaste={prevent}
          onDrop={prevent}
          onContextMenu={prevent}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default TypingChallenge;
