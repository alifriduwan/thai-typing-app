import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo-3.png";
import { Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const em = email.trim().toLowerCase();

    if (!isValidEmail(em)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (password !== confirm) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, email: em, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || res.statusText);
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
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
          className="h-10 w-auto object-contain -mr-1"
        />
        <span className="text-lg font-semibold text-[#2B8BE6] hidden sm:block">
          ThaiTyping
        </span>
      </NavLink>

      <div className="hidden md:flex md:w-[30%] bg-[#F8F8F8] flex-col justify-center items-center px-12 border-r border-gray-200">
        <img
          src={logo}
          alt="ThaiTyping"
          className="w-40 h-auto object-contain mb-6"
        />

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Join us!</h2>

        <p className="text-gray-600 mb-6 text-center">
          สร้างบัญชีเพื่อบันทึกความก้าวหน้า และพัฒนาทักษะการพิมพ์ของคุณ
        </p>

        <p className="text-gray-600">
          มีบัญชีแล้ว ?
          <Link
            to="/login"
            className="ml-2 font-semibold text-[#2B8BE6] hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>

      <div className="flex w-full md:w-[70%] justify-center items-center px-6 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            สร้างบัญชี
          </h2>

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6]"
              />
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                style={{
                  WebkitTextSecurity: showPassword ? "none" : "disc",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="mb-4 relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B8BE6] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                style={{
                  WebkitTextSecurity: showConfirm ? "none" : "disc",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
              {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
