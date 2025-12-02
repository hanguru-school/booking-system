"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MobileTaggingInterface from "@/components/tagging/MobileTaggingInterface";

function MobileTaggingContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const location = searchParams.get("location") || "교실 A";

  if (!uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            UID가 필요합니다
          </h1>
          <p className="text-gray-600">태깅을 위해 UID 정보가 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <MobileTaggingInterface
      uid={uid}
      deviceType="smartphone"
      location={location}
    />
  );
}

export default function MobileTaggingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <MobileTaggingContent />
    </Suspense>
  );
}
