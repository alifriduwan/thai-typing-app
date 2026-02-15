import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Star } from "lucide-react";
import { loadGuestTypingProgress } from "../lib/guestProgressTyping";

// const API_BASE = "http://localhost:5000/api/typing";
const API_BASE = `${import.meta.env.VITE_API_URL}/api/typing`;

const LessonList_1 = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(
    lessonId ? parseInt(lessonId, 10) : 1,
  );

  const [levels, setLevels] = useState([]);
  const [nextGlobal, setNextGlobal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({});

  const loadState = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        const guest = loadGuestTypingProgress();
        setNextGlobal(guest.nextGlobal);
        const guestMap = {};
        if (guest.completed) {
          guest.completed.forEach((item) => {
            guestMap[item.global_index] = item.stars || 0;
          });
        }
        setProgressMap(guestMap);
        return;
      }

      const res = await fetch(`${API_BASE}/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        const guest = loadGuestTypingProgress();
        setNextGlobal(guest.nextGlobal);
        const guestMap = {};
        if (guest.completed) {
          guest.completed.forEach((item) => {
            guestMap[item.global_index] = item.stars || 0;
          });
        }
        setProgressMap(guestMap);
        return;
      }

      const data = await res.json();
      if (!data.error) {
        setNextGlobal(data.next_global);
        await loadProgress(token);
      }
    } catch {
      const guest = loadGuestTypingProgress();
      setNextGlobal(guest.nextGlobal);
      const guestMap = {};
      if (guest.completed) {
        guest.completed.forEach((item) => {
          guestMap[item.global_index] = item.stars || 0;
        });
      }
      setProgressMap(guestMap);
    }
  };

  const loadProgress = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach((item) => {
          map[item.global_index] = item.stars;
        });
        setProgressMap(map);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  useEffect(() => {
    const fetchLessons = async () => {
      const res = await fetch(`${API_BASE}/lessons`);
      const data = await res.json();
      setLessons(data);
    };
    fetchLessons();
  }, [API_BASE]);

  useEffect(() => {
    if (lessonId) setActiveLesson(parseInt(lessonId, 10));
  }, [lessonId]);

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE}/lesson/${activeLesson}`);
      const data = await res.json();
      if (!data.error) setLevels(data.levels);
      setLoading(false);
    };

    fetchLevels();
    loadState();
  }, [activeLesson]);

  useEffect(() => {
    const handleFocus = () => loadState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeLesson]);

  const handleLevelClick = (lv) => {
    navigate(`/lessons/${activeLesson}/steps/${lv}`);
  };

  const handleLessonChange = (id) => {
    navigate(`/lessons/${id}`);
  };

  const renderStars = (globalIndex, locked) => {
    const stars = progressMap[globalIndex] || 0;

    return (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3].map((num) => {
          if (locked) {
            return (
              <Star key={num} size={16} className="text-gray-300" fill="none" />
            );
          } else if (stars === 0) {
            return (
              <Star key={num} size={16} className="text-blue-300" fill="none" />
            );
          } else if (num <= stars) {
            return (
              <Star
                key={num}
                size={16}
                className="text-yellow-400"
                fill="currentColor"
              />
            );
          } else {
            return (
              <Star key={num} size={16} className="text-gray-300" fill="none" />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            บทเรียนฝึกพิมพ์
          </h1>
          <div className="flex justify-center mt-3">
            <div className="w-28 h-1 bg-[#2B8BE6]/70 rounded-full"></div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="hidden md:block w-64">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-6">
              <h3 className="font-bold text-gray-700 mb-4">บทเรียน</h3>

              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.lesson_id}
                    onClick={() => handleLessonChange(lesson.lesson_id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeLesson === lesson.lesson_id
                        ? "bg-[#2B8BE6] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.lesson_id}
                  onClick={() => handleLessonChange(lesson.lesson_id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-md ${
                    activeLesson === lesson.lesson_id
                      ? "bg-[#2B8BE6] text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {lesson.title}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {lessons.find((l) => l.lesson_id === activeLesson)?.title}
            </h2>

            {loading ? (
              <p className="text-gray-500">กำลังโหลด...</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {levels.map((lv) => {
                  const locked = lv.global_index > nextGlobal;
                  const stars = progressMap[lv.global_index] || 0;

                  return (
                    <div
                      key={lv.level}
                      onClick={() => !locked && handleLevelClick(lv.level)}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        locked
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                          : "bg-white border-[#2B8BE6]/30 cursor-pointer hover:shadow-md hover:-translate-y-1"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            ระดับ {lv.level}
                          </span>
                          {locked && (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>

                        {renderStars(lv.global_index, locked)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonList_1;
