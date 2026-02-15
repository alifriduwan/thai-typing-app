import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Play, RotateCcw } from "lucide-react";
import { loadTypingRaceGuestProgress } from "../lib/typingRaceGuestProgress";

const LevelItem = ({ levelName, status, levelId, botWpm }) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  const path = `/minigames/typing-race/level/${levelId}`;

  const baseCard =
    "rounded-xl border p-5 transition-all duration-200 flex items-center justify-between";

  const cardStyle = isLocked
    ? "bg-gray-100 border-gray-300"
    : isCurrent
      ? "bg-[#2B8BE6]/10 border-[#2B8BE6] shadow-md"
      : "bg-white border-gray-200 hover:shadow-md hover:-translate-y-1 cursor-pointer";

  const buttonBase =
    "flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition";

  const buttonStyle = isLocked
    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
    : isCompleted
      ? "bg-emerald-500 text-white hover:bg-emerald-600"
      : "bg-[#3ACD27] text-white hover:bg-[#2FB81F]";

  const label = isLocked
    ? "Locked"
    : isCompleted
      ? "เล่นอีกครั้ง"
      : "เริ่มเล่น";

  const icon = isLocked ? (
    <Lock size={16} />
  ) : isCompleted ? (
    <RotateCcw size={16} />
  ) : (
    <Play size={16} />
  );

  return (
    <div className={`${baseCard} ${cardStyle}`}>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{levelName}</h2>
        <p className="text-sm text-gray-500 mt-1">Bot ความเร็ว {botWpm} WPM</p>
      </div>

      {isLocked ? (
        <button className={`${buttonBase} ${buttonStyle}`} disabled>
          {icon}
          {label}
        </button>
      ) : (
        <Link to={path} className={`${buttonBase} ${buttonStyle}`}>
          {icon}
          {label}
        </Link>
      )}
    </div>
  );
};

const TypingRaceLevelSelect = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let abort = false;

    const fetchAll = async () => {
      setLoading(true);
      setErr("");

      try {
        const resLevels = await fetch(`${API_BASE}/api/typing-race/levels`);

        if (!resLevels.ok) throw new Error("โหลดรายการด่านไม่สำเร็จ");
        const list = await resLevels.json();

        let nextAllowed = 1;
        const token = localStorage.getItem("access_token");

        if (token) {
          try {
            const resState = await fetch(`${API_BASE}/api/typing-race/state`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (resState.ok) {
              const st = await resState.json();
              nextAllowed = st?.next_level || 1;
            } else {
              const gp = loadTypingRaceGuestProgress();
              nextAllowed = Math.max(1, Number(gp.maxCompleted || 0) + 1);
            }
          } catch {
            const gp = loadTypingRaceGuestProgress();
            nextAllowed = Math.max(1, Number(gp.maxCompleted || 0) + 1);
          }
        } else {
          const gp = loadTypingRaceGuestProgress();
          nextAllowed = Math.max(1, Number(gp.maxCompleted || 0) + 1);
        }

        const withStatus = list.map((l) => {
          let status = "locked";
          if (l.id < nextAllowed) status = "completed";
          else if (l.id === nextAllowed) status = "current";
          return { ...l, status };
        });

        if (!abort) setLevels(withStatus);
      } catch (e) {
        if (!abort) setErr(e.message || "เกิดข้อผิดพลาด");
      } finally {
        if (!abort) setLoading(false);
      }
    };

    fetchAll();

    const onGuestProgress = () => fetchAll();
    window.addEventListener("typingrace:progress", onGuestProgress);

    return () => {
      abort = true;
      window.removeEventListener("typingrace:progress", onGuestProgress);
    };
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            เกมแข่งพิมพ์กับ Bot
          </h1>
          <div className="w-24 h-1 bg-[#2B8BE6]/70 mx-auto mt-3 rounded"></div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            กำลังโหลดสถานะด่าน...
          </div>
        ) : err ? (
          <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {err}
          </div>
        ) : levels.length === 0 ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl">
            ยังไม่มีด่านในระบบ
          </div>
        ) : (
          <div className="space-y-4">
            {levels.map((level) => (
              <LevelItem
                key={level.id}
                levelName={level.name}
                status={level.status}
                levelId={level.id}
                botWpm={level.bot_wpm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingRaceLevelSelect;
