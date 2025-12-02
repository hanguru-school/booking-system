import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  center?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "",
  sm: "px-4 py-2",
  md: "px-6 py-4",
  lg: "px-8 py-6",
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  center = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

// 모바일 최적화된 카드 컴포넌트
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function MobileCard({
  children,
  className,
  onClick,
  interactive = false,
}: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4",
        "transition-all duration-200",
        interactive && "hover:shadow-md hover:border-gray-300 cursor-pointer",
        "active:scale-95",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 모바일 최적화된 버튼 컴포넌트
interface MobileButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

export function MobileButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  className,
}: MobileButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-95",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 모바일 최적화된 입력 필드 컴포넌트
interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "tel";
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function MobileInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
  fullWidth = false,
  className,
}: MobileInputProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:bg-gray-50 disabled:cursor-not-allowed",
          "text-base",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// 모바일 최적화된 모달 컴포넌트
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: MobileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
          "max-h-[90vh] overflow-y-auto",
          className,
        )}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 바디 */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
