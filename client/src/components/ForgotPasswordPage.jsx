import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo-3.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    // validate แบบง่าย (frontend only)
    if (!email.includes("@")) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    setLoading(true);

    // จำลองการส่ง request
    setTimeout(() => {
      setLoading(false);
      navigate("/forgot-password/success", { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-100">
      {/* Logo มุมซ้ายบน */}
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

      {/* ฝั่งซ้าย (เหมือน LoginPage) */}
      <div className="hidden md:flex md:w-[35%] bg-[#F8F8F8] flex-col justify-center items-center px-12 border-r border-gray-200">
        <img
          src={logo}
          alt="ThaiTyping"
          className="w-40 h-auto object-contain mb-6"
        />

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome back!</h2>

        <p className="text-gray-600 mb-6 text-center">จำรหัสผ่านได้แล้ว?</p>

        <Link
          to="/login"
          className="font-semibold text-[#2B8BE6] hover:underline"
        >
          กลับไปเข้าสู่ระบบ
        </Link>
      </div>

      {/* ฝั่งขวา */}
      <div className="flex w-full md:w-[65%] justify-center items-center px-6 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            ลืมรหัสผ่าน
          </h2>

          <p className="text-center text-gray-500 mb-6">
            กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
          </p>

          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-[#2B8BE6] hover:underline"
            >
              กลับไปเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
