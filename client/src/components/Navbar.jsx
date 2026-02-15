import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearToken } from "../lib/auth";
import logo from "../assets/logo.png";

import {
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const linkClasses =
    "px-3 py-2 rounded-md hover:bg-white/10 transition-all duration-200 border-b-2 border-transparent";
  const activeLinkClasses = "border-b-2 border-white rounded-none";

  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("username") || "",
  );
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const update = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
      setDisplayName(localStorage.getItem("username") || "");
    };
    update();
    window.addEventListener("auth:changed", update);
    return () => window.removeEventListener("auth:changed", update);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goDashboard = () => {
    setOpenMenu(false);
    navigate("/user-profile");
  };

  const doLogout = () => {
    setOpenMenu(false);
    clearToken();
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-[#2B8BE6] text-white shadow-lg font-sans h-20">
      <div className="container mx-auto h-full px-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-1">
          <img
            src={logo}
            alt="ThaiTyping Logo"
            className="h-12 w-auto object-contain -mr-2"
          />
          <span className="text-xl font-semibold hidden sm:block">
            ThaiTyping
          </span>
        </NavLink>

        <div className="flex items-center text-base md:text-lg">
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ""}`
              }
            >
              หน้าแรก
            </NavLink>
            <NavLink
              to="/lessons"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ""}`
              }
            >
              บทเรียน
            </NavLink>
            <NavLink
              to="/typing-test"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ""}`
              }
            >
              ทดสอบพิมพ์
            </NavLink>
            <NavLink
              to="/minigames"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ""}`
              }
            >
              มินิเกม
            </NavLink>
          </div>

          <div className="border-l-2 border-white/70 h-6 mx-4 hidden md:block" />

          {!isLoggedIn ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ""}`
              }
            >
              เข้าสู่ระบบ
            </NavLink>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
              >
                <UserCircleIcon className="h-7 w-7 text-white" />
                <span className="hidden md:block">
                  {displayName || "ผู้ใช้"}
                </span>
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${
                    openMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10">
                  <div className="py-2">
                    <button
                      onClick={goDashboard}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-[#2B8BE6]/10 hover:text-[#2B8BE6] transition-colors duration-200"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                      โปรไฟล์ของฉัน
                    </button>
                    <button
                      onClick={doLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors duration-200 border-t border-gray-100 mt-1 pt-2"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
