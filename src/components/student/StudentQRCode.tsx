"use client";

import React from "react";
import QRCode from "react-qr-code";

interface StudentQRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export default function StudentQRCode({
  data,
  size = 200,
  className = "",
}: StudentQRCodeProps) {
  return (
    <div
      className={`flex justify-center p-4 bg-white rounded-lg shadow-md ${className}`}
    >
      <QRCode
        value={data}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
