import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, Play, RotateCcw } from "lucide-react";
import { loadGuestProgress } from "../lib/guestProgress";

const LevelItem = ({ levelName, status, gameId, levelId }) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  const path = `/minigames/${gameId}/${levelId}`;

  const cardBase =
    "flex items-center justify-between p-5 rounded-xl border transition-all duration-200";

  const cardStyle = isLocked
    ? "bg-gray-100 border-gray-300"
    : isCurrent
      ? "bg-[#2B8BE6]/10 border-[#2B8BE6] shadow-md"
      : "bg-white border-gray-200 hover:shadow-md hover:-translate-y-1 cursor-pointer";

  const btnBase =
    "flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition";

  const btnStyle = isLocked
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
    <div className={`${cardBase} ${cardStyle}`}>
      <h2 className="text-lg font-bold text-gray-800">{levelName}</h2>

      {isLocked ? (
        <button disabled className={`${btnBase} ${btnStyle}`}>
          {icon}
          {label}
        </button>
      ) : (
        <Link to={path} className={`${btnBase} ${btnStyle}`}>
          {icon}
          {label}
        </Link>
      )}
    </div>
  );
};

const GAME_TITLES = {
  "spelling-quiz": "เลือกพิมพ์คำที่ถูกต้อง",
  "typing-fall": "พิมพ์คำที่ตกลงมา",
};

const LevelSelect = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const { gameId } = useParams();
  const gameTitle = GAME_TITLES[gameId] || "เลือกด่าน";

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let abort = false;

    const fetchAll = async () => {
      setLoading(true);
      setErr("");

      try {
        let list = [];
        if (gameId === "spelling-quiz") {
          const resLevels = await fetch(`${API_BASE}/api/spelling/levels`);

          if (!resLevels.ok) throw new Error("โหลดรายการด่านไม่สำเร็จ");
          list = await resLevels.json();
        } else {
          list = [
            { id: 1, name: "Level 1" },
            { id: 2, name: "Level 2" },
            { id: 3, name: "Level 3" },
          ];
        }

        let nextAllowed = 1;

        if (gameId === "spelling-quiz") {
          const token = localStorage.getItem("access_token");

          if (token) {
            let resState = await fetch(`${API_BASE}/api/spelling/state`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (resState.status === 401) {
              localStorage.removeItem("access_token");
              localStorage.removeItem("username");
              window.dispatchEvent(new Event("auth:changed"));
              resState = null;
            }

            if (resState && resState.ok) {
              const st = await resState.json();
              nextAllowed = Math.max(1, Number(st?.next_level || 1));
            } else {
              const gp = loadGuestProgress();
              nextAllowed = Math.max(1, Number(gp.maxCompleted || 0) + 1);
            }
          } else {
            const gp = loadGuestProgress();
            nextAllowed = Math.max(1, Number(gp.maxCompleted || 0) + 1);
          }
        } else {
          nextAllowed = Number.MAX_SAFE_INTEGER;
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
    window.addEventListener("spelling:progress", onGuestProgress);

    const onAuthChanged = () => fetchAll();
    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      abort = true;
      window.removeEventListener("spelling:progress", onGuestProgress);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [API_BASE, gameId]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {gameTitle}
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
                gameId={gameId}
                levelId={level.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelSelect;
