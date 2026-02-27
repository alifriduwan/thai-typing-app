import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Zap, Target, CheckCircle } from "lucide-react";

const StatCard = ({ icon, value, label, sub, color }) => {
  return (
    <div className="bg-[#1f2937] text-white rounded-2xl p-6 shadow-lg border border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>

      <div className="flex-1">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-gray-300 text-sm">{label}</div>

        <div className="mt-3 border-t border-gray-600"></div>

        {sub && <div className="text-gray-400 text-sm mt-2">{sub}</div>}
      </div>
    </div>
  );
};

const UserProfileDashboard = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [avgSpeed, setAvgSpeed] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [history, setHistory] = useState([]);
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
      try {
        const res = await fetch(
          `${API_BASE}/api/typing_test/me/summary?days=7`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");

        setAvgSpeed(Number(data.avg_speed || 0));
        setAvgAccuracy(Number(data.avg_accuracy || 0));

        const formattedHistory = Array.isArray(data.history)
          ? data.history.map((item) => ({
              date: item.date,
              speed: item.speed || item["ความเร็ว (wpm)"] || 0,
              accuracy: item.accuracy || item["ความแม่นยำ (%)"] || 0,
            }))
          : [];

        setHistory(formattedHistory);

        console.log("API Response:", data);
        console.log("Formatted History:", formattedHistory);
      } catch (e) {
        setErr(e.message);
      }
    };

    const fetchLessonProgress = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/typing/state`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.total_global > 0) {
          const percent = (data.max_completed_global / data.total_global) * 100;
          setLessonProgress(Math.round(percent));
        }
      } catch (e) {
        console.error("Error fetching lesson progress:", e);
      }
    };

    Promise.all([fetchSummary(), fetchLessonProgress()]).finally(() =>
      setLoading(false),
    );
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            ความก้าวหน้าของฉัน
          </h1>
          <div className="w-24 h-1 bg-[#2B8BE6] mt-3 rounded"></div>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow">กำลังโหลด...</div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            {err}
          </div>
        ) : (
          <>
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  แนวโน้มความเร็ว (7 วัน)
                </h3>

                {history.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-gray-400">
                    ยังไม่มีข้อมูลการทดสอบ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={history}>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="speed"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                        name="ความเร็ว (WPM)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  แนวโน้มความแม่นยำ (7 วัน)
                </h3>

                {history.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-gray-400">
                    ยังไม่มีข้อมูลการทดสอบ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={history}>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="accuracy"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        name="ความแม่นยำ (%)"
                      />
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
