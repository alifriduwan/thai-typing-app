import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { Zap, Target, CheckCircle } from "lucide-react";

// ---- helpers ----------------------------------------------------------------

const LEVEL_COLOR = {
  easy: "#10b981", // เขียว
  medium: "#f59e0b", // เหลือง
  hard: "#ef4444", // แดง
};

const LEVEL_LABEL = {
  easy: "ง่าย",
  medium: "กลาง",
  hard: "ยาก",
};

/**
 * รวม history (ที่มีหลาย row ต่อวันเพราะแยก level) เป็น array
 * ที่แต่ละ element = 1 วัน และมี key easy/medium/hard แยกกัน
 * เช่น { date:"25/07", easy_speed:40, medium_speed:55, hard_speed:70,
 *                       easy_acc:95,  medium_acc:88,   hard_acc:80  }
 */
const mergeHistoryByDate = (rawHistory) => {
  const map = {};
  rawHistory.forEach((item) => {
    if (!map[item.date]) map[item.date] = { date: item.date };
    const lv = item.level;
    map[item.date][`${lv}_speed`] = item.speed;
    map[item.date][`${lv}_accuracy`] = item.accuracy;
    map[item.date][`${lv}_level`] = lv; // เก็บไว้ใช้ระบายสี
  });
  return Object.values(map);
};

// ---- sub-components ---------------------------------------------------------

const StatCard = ({ icon, value, label, sub, color }) => (
  <div className="bg-[#1f2937] text-white rounded-2xl p-6 shadow-lg border border-gray-700 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-gray-300 text-sm">{label}</div>
      <div className="mt-3 border-t border-gray-600" />
      {sub && <div className="text-gray-400 text-sm mt-2">{sub}</div>}
    </div>
  </div>
);

/** Legend แสดงสีของแต่ละ level */
const LevelLegend = () => (
  <div className="flex gap-4 mb-3 flex-wrap">
    {Object.entries(LEVEL_LABEL).map(([lv, label]) => (
      <div key={lv} className="flex items-center gap-1.5 text-sm text-gray-600">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: LEVEL_COLOR[lv] }}
        />
        {label}
      </div>
    ))}
  </div>
);

/**
 * CustomBar — ระบายสีแท่งตาม level ที่ฝังอยู่ใน dataKey
 * dataKey จะเป็น "easy_speed" / "medium_speed" / "hard_speed" เป็นต้น
 */
const CustomBar = (props) => {
  const { x, y, width, height, level } = props;
  if (!height || height <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={LEVEL_COLOR[level] || "#8b5cf6"}
      rx={4}
      ry={4}
    />
  );
};

/**
 * สร้าง Bar สำหรับแต่ละ level และ metric
 * ใช้ Cell แทน shape เพื่อหลีกเลี่ยง recharts quirk
 */
const LevelBars = ({ metric, mergedData }) => (
  <>
    {["easy", "medium", "hard"].map((lv) => (
      <Bar
        key={`${lv}_${metric}`}
        dataKey={`${lv}_${metric}`}
        name={LEVEL_LABEL[lv]}
        fill={LEVEL_COLOR[lv]}
        radius={[4, 4, 0, 0]}
        maxBarSize={32}
      >
        {mergedData.map((entry, index) => (
          <Cell
            key={`cell-${lv}-${index}`}
            fill={LEVEL_COLOR[lv]}
            fillOpacity={entry[`${lv}_${metric}`] != null ? 1 : 0}
          />
        ))}
      </Bar>
    ))}
  </>
);

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1f2937",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
  },
};

// ---- main component ---------------------------------------------------------

const UserProfileDashboard = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [avgSpeed, setAvgSpeed] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [mergedHistory, setMergedHistory] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setErr("กรุณาเข้าสู่ระบบเพื่อดูสถิติ");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      const res = await fetch(`${API_BASE}/api/typing_test/me/summary?days=7`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");

      setAvgSpeed(Number(data.avg_speed || 0));
      setAvgAccuracy(Number(data.avg_accuracy || 0));

      const raw = Array.isArray(data.history)
        ? data.history.map((item) => ({
            date: item.date,
            level: item.level,
            speed: item["ความเร็ว (wpm)"] ?? item.speed ?? 0,
            accuracy: item["ความแม่นยำ (%)"] ?? item.accuracy ?? 0,
          }))
        : [];

      setMergedHistory(mergeHistoryByDate(raw));
    };

    const fetchLessonProgress = async () => {
      const res = await fetch(`${API_BASE}/api/typing/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.total_global > 0) {
        setLessonProgress(
          Math.round((data.max_completed_global / data.total_global) * 100),
        );
      }
    };

    Promise.all([
      fetchSummary().catch((e) => setErr(e.message)),
      fetchLessonProgress().catch((e) => console.error(e)),
    ]).finally(() => setLoading(false));
  }, [API_BASE]);

  // ---------- render ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            ความก้าวหน้าของฉัน
          </h1>
          <div className="w-24 h-1 bg-[#2B8BE6] mt-3 rounded" />
        </div>

        {/* states */}
        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow">กำลังโหลด...</div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            {err}
          </div>
        ) : (
          <>
            {/* stat cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <StatCard
                icon={<CheckCircle size={28} className="text-white" />}
                value={`${lessonProgress}%`}
                label="completed"
                sub="progress in lessons"
                color="bg-blue-500"
              />
              <StatCard
                icon={<Zap size={28} className="text-white" />}
                value={avgSpeed}
                label="speed (WPM)"
                sub="average typing speed"
                color="bg-purple-500"
              />
              <StatCard
                icon={<Target size={28} className="text-white" />}
                value={`${avgAccuracy}%`}
                label="accuracy (%)"
                sub="average accuracy"
                color="bg-green-500"
              />
            </div>

            {/* charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* speed chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  แนวโน้มความเร็ว (7 วัน)
                </h3>
                <LevelLegend />

                {mergedHistory.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-gray-400">
                    ยังไม่มีข้อมูลการทดสอบ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={mergedHistory} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                      />
                      <Tooltip {...tooltipStyle} />
                      <LevelBars metric="speed" mergedData={mergedHistory} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* accuracy chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  แนวโน้มความแม่นยำ (7 วัน)
                </h3>
                <LevelLegend />

                {mergedHistory.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-gray-400">
                    ยังไม่มีข้อมูลการทดสอบ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={mergedHistory} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6b7280" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "#6b7280" }}
                        tickLine={{ stroke: "#e5e7eb" }}
                      />
                      <Tooltip {...tooltipStyle} />
                      <LevelBars metric="accuracy" mergedData={mergedHistory} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileDashboard;
