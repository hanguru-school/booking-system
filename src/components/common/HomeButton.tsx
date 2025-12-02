"use client";

import Link from "next/link";
import { Home } from "lucide-react";

interface HomeButtonProps {
  variant?: "default" | "floating" | "header";
  className?: string;
}

export default function HomeButton({
  variant = "default",
  className = "",
}: HomeButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 transition-colors";

  const variantClasses = {
    default:
      "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg",
    floating:
      "fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-xl z-40",
    header:
      "px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg",
  };

  const iconSizes = {
    default: "w-4 h-4",
    floating: "w-6 h-6",
    header: "w-4 h-4",
  };

  return (
    <Link
      href="/"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="메인 페이지로 이동"
    >
      <Home className={iconSizes[variant]} />
      {variant !== "floating" && <span>메인 페이지</span>}
    </Link>
  );
}
