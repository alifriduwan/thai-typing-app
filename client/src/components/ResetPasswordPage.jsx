import React, { useState } from "react";
import { useParams, useNavigate, Link, NavLink } from "react-router-dom";
import logo from "../assets/logo-3.png";

const ResetPasswordPage = () => {
  const { token } = useParams(); // รับ token จาก URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    // Frontend only (จำลอง)
    setTimeout(() => {
      setLoading(false);

      // ปกติจะส่ง password + token ไป backend
      console.log("Token:", token);
      console.log("New password:", password);

      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-100">
      {/* Logo มุมซ้ายบน */}
      <NavLink
        to="/"
        className="fixed top-6 left-8 flex items-center gap-1 z-50"
      >
        <img src={logo} alt="ThaiTyping Logo" className="h-12 -mr-2" />
        <span className="text-xl text-[#2B8BE6] font-semibold hidden sm:block">
          ThaiTyping
        </span>
      </NavLink>

      {/* ฝั่งซ้าย */}
      <div className="hidden md:flex md:w-[35%] bg-[#F8F8F8] flex-col justify-center items-center px-12 border-r border-gray-200">
        <img src={logo} alt="ThaiTyping" className="w-40 mb-6" />

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome back!</h2>

        <p className="text-gray-600">ตั้งรหัสผ่านใหม่เพื่อเข้าใช้งาน</p>
      </div>

      {/* ฝั่งขวา */}
      <div className="flex w-full md:w-[65%] justify-center items-center px-6 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ตั้งรหัสผ่านใหม่
          </h2>

          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                รหัสผ่านใหม่
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
                />

                {/* ปุ่มโชว์รหัส */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  👁
                </button>
              </div>
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
              {loading ? "กำลังบันทึก..." : "ตั้งรหัสผ่าน"}
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

export default ResetPasswordPage;
