import React, { useState } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { setToken } from "../lib/auth";
import logo from "../assets/logo-3.png";

const LoginPage = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/user-profile";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // debug ดู response จริง
      console.log("Login response:", data);

      if (!res.ok) {
        throw new Error(data?.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      // ตรวจว่ามี token จริง
      if (!data.access_token) {
        throw new Error("เซิร์ฟเวอร์ไม่ได้ส่ง access_token กลับมา");
      }

      // เก็บ token
      setToken(data.access_token);

      // เก็บ username (ถ้ามี)
      if (data.username) {
        localStorage.setItem("username", data.username);
      }

      // ตรวจว่าเก็บสำเร็จจริง
      console.log("Saved token:", localStorage.getItem("access_token"));

      // ไปหน้าถัดไป
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-100">
      <NavLink
        to="/"
        className="fixed top-6 left-8 flex items-center gap-1 z-50"
      >
        <img
          src={logo}
          alt="ThaiTyping Logo"
          className="h-12 w-auto object-contain -mr-2"
        />
        <span className="text-xl text-[#2B8BE6] font-semibold hidden sm:block">
          ThaiTyping
        </span>
      </NavLink>

      {/* Left panel */}
      <div className="hidden md:flex md:w-[35%] bg-[#F8F8F8] flex-col justify-center items-center px-12 border-r border-gray-200">
        <img src={logo} alt="ThaiTyping" className="w-40 mb-6" />

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome back!</h2>

        <p className="text-gray-600 mb-6 text-center">
          ฝึกพิมพ์ไทยให้เร็วและแม่นยำยิ่งขึ้น
        </p>

        <p className="text-gray-600">
          ยังไม่มีบัญชี ?
          <Link
            to="/signup"
            className="ml-2 font-semibold text-[#2B8BE6] hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex w-full md:w-[65%] justify-center items-center px-6 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <label className="block text-sm text-gray-600 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
              />
            </div>

            {error && (
              <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-[#2B8BE6]/60" : "bg-[#2B8BE6] hover:bg-[#2478C9]"
              } text-white font-semibold py-3 rounded-lg transition`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/forgot-password"
              className="text-sm text-[#2B8BE6] hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
