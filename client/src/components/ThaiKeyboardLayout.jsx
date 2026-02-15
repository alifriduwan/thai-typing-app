import React, { useState, useEffect } from "react";

const ThaiKeyboardLayout = ({ currentChar, lastKeystroke, className = "" }) => {
  const thaiKeyboard = [
    [
      { normal: "_", shift: "%" },
      { normal: "ๅ", shift: "+" },
      { normal: "/", shift: "๑" },
      { normal: "-", shift: "๒" },
      { normal: "ภ", shift: "๓" },
      { normal: "ถ", shift: "๔" },
      { normal: "ุ", shift: "ู" },
      { normal: "ึ", shift: "฿" },
      { normal: "ค", shift: "๕" },
      { normal: "ต", shift: "๖" },
      { normal: "จ", shift: "๗" },
      { normal: "ข", shift: "๘" },
      { normal: "ช", shift: "๙" },
      {
        normal: "Backspace",
        shift: "Backspace",
        width: "w-24",
        isSpecial: true,
        displayName: "⌫",
      },
    ],
    [
      {
        normal: "Tab",
        shift: "Tab",
        width: "w-16",
        isSpecial: true,
        displayName: "Tab",
      },
      { normal: "ๆ", shift: "๐" },
      { normal: "ไ", shift: '"' },
      { normal: "ำ", shift: "ฎ" },
      { normal: "พ", shift: "ฑ" },
      { normal: "ะ", shift: "ธ" },
      { normal: "ั", shift: "ํ" },
      { normal: "ี", shift: "๊" },
      { normal: "ร", shift: "ณ" },
      { normal: "น", shift: "ฯ" },
      { normal: "ย", shift: "ญ" },
      { normal: "บ", shift: "ฐ" },
      { normal: "ล", shift: "," },
      { normal: "ฃ", shift: "ฅ" },
    ],
    [
      {
        normal: "CapsLock",
        shift: "CapsLock",
        width: "w-20",
        isSpecial: true,
        displayName: "Caps",
      },
      { normal: "ฟ", shift: "ฤ" },
      { normal: "ห", shift: "ฆ" },
      { normal: "ก", shift: "ฏ" },
      { normal: "ด", shift: "โ" },
      { normal: "เ", shift: "ฌ" },
      { normal: "้", shift: "็" },
      { normal: "่", shift: "๋" },
      { normal: "า", shift: "ษ" },
      { normal: "ส", shift: "ศ" },
      { normal: "ว", shift: "ซ" },
      { normal: "ง", shift: "." },
      {
        normal: "Enter",
        shift: "Enter",
        width: "w-24",
        isSpecial: true,
        displayName: "Enter",
      },
    ],
    [
      {
        normal: "Shift",
        shift: "Shift",
        width: "w-28",
        isSpecial: true,
        displayName: "Shift",
      },
      { normal: "ผ", shift: "(" },
      { normal: "ป", shift: ")" },
      { normal: "แ", shift: "ฉ" },
      { normal: "อ", shift: "ฮ" },
      { normal: "ิ", shift: "ฺ" },
      { normal: "ื", shift: "์" },
      { normal: "ท", shift: "?" },
      { normal: "ม", shift: "ฒ" },
      { normal: "ใ", shift: "ฬ" },
      { normal: "ฝ", shift: "ฦ" },
      {
        normal: "Shift",
        shift: "Shift",
        width: "w-28",
        isSpecial: true,
        displayName: "Shift",
      },
    ],
    [
      {
        normal: " ",
        shift: " ",
        width: "w-[32rem]",
        isSpecial: true,
        displayName: "Space",
      },
    ],
  ];

  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [activeKey, setActiveKey] = useState({ key: null, type: "" });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (lastKeystroke && lastKeystroke.key != null) {
      setActiveKey({
        key: lastKeystroke.key,
        type: lastKeystroke.correct ? "correct" : "incorrect",
      });

      const timer = setTimeout(() => {
        setActiveKey({ key: null, type: "" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastKeystroke]);

  const isTargetKey = (key) => {
    if (key.isSpecial) {
      if (key.normal === " " && currentChar === " ") return true;
      if (
        key.normal === "Enter" &&
        (currentChar === "Enter" || currentChar === "\n")
      )
        return true;
      if (key.normal === "Shift" && currentChar === "Shift") return true;
      return false;
    }
    const displayChar = isShiftPressed ? key.shift : key.normal;
    return currentChar === displayChar;
  };

  const isActiveFromLastKey = (key) => {
    const pressed = activeKey.key;
    if (pressed == null) return false;
    if (key.isSpecial) {
      if (key.normal === " " && pressed === " ") return true;
      if (key.normal === "Enter" && pressed === "Enter") return true;
      if (key.normal === "Shift" && pressed === "Shift") return true;
      return false;
    }
    return pressed === key.normal || pressed === key.shift;
  };

  const getKeyStyle = (key) => {
    const baseHit = isActiveFromLastKey(key)
      ? activeKey.type === "correct"
        ? "correct"
        : "incorrect"
      : isTargetKey(key)
      ? "target"
      : "";

    if (baseHit === "correct") {
      return "bg-green-500 text-white border-green-600 shadow-lg ring-2 ring-green-300 transform scale-110";
    }
    if (baseHit === "incorrect") {
      return "bg-red-500 text-white border-red-600 shadow-lg ring-2 ring-red-300 transform scale-110";
    }
    if (baseHit === "target") {
      return "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 shadow-lg";
    }

    return key.isSpecial
      ? "bg-gray-300 text-gray-700 border-gray-400"
      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50";
  };

  const renderKey = (key, index) => {
    const baseClasses =
      "h-12 border-2 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative select-none";
    const widthClass = key.width || "w-12";
    const styleClass = getKeyStyle(key);

    return (
      <div key={index} className={`${baseClasses} ${widthClass} ${styleClass}`}>
        {key.isSpecial ? (
          <span className="text-xs font-bold">
            {key.displayName || key.normal}
          </span>
        ) : (
          <>
            <span className="text-xs absolute top-0.5 left-1 text-gray-500">
              {key.shift}
            </span>
            <span className="text-lg font-bold mt-1">{key.normal}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-gray-100 p-4 rounded-xl shadow-inner ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          {isShiftPressed && (
            <span className="text-blue-600 text-sm font-semibold bg-blue-100 px-3 py-1 rounded-full">
              กด Shift อยู่
            </span>
          )}
        </div>
        <div className="space-y-1">
          {thaiKeyboard.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key, keyIndex) => renderKey(key, keyIndex))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThaiKeyboardLayout;
