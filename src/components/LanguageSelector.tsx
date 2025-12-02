"use client";

import { useState, useEffect } from "react";
import {
  Language,
  getStoredLanguage,
  setStoredLanguage,
  getTranslation,
} from "@/lib/i18n";

interface LanguageSelectorProps {
  onLanguageChange: (language: Language) => void;
}

export default function LanguageSelector({
  onLanguageChange,
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ko");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    setCurrentLanguage(storedLanguage);
  }, []);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    setStoredLanguage(language);
    onLanguageChange(language);
    setIsOpen(false);
  };

  const t = getTranslation(currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span>🌐</span>
        <span>{currentLanguage === "ko" ? t.korean : t.japanese}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleLanguageChange("ko")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentLanguage === "ko"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              🇰🇷 {getTranslation("ko").korean}
            </button>
            <button
              onClick={() => handleLanguageChange("ja")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentLanguage === "ja"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              🇯🇵 {getTranslation("ja").japanese}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
