import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo-3.png";

const ForgotPasswordSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Logo */}
      <NavLink to="/" className="fixed top-6 left-8 flex items-center gap-1">
        <img src={logo} alt="ThaiTyping Logo" className="h-12 -mr-2" />
        <span className="text-xl text-[#2B8BE6] font-semibold hidden sm:block">
          ThaiTyping
        </span>
      </NavLink>

      {/* Center Box */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 w-full max-w-xl text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-400 rounded-xl flex items-center justify-center text-5xl">
                ✉️
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center">
                1
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">ขอบคุณ!</h2>

          <p className="text-gray-600 mb-6">
            กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
          </p>

          <Link
            to="/login"
            className="inline-block bg-[#2B8BE6] hover:bg-[#2478C9] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            กลับไปเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordSuccess;
