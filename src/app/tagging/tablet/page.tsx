"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TabletTaggingInterface from "@/components/tagging/TabletTaggingInterface";

function TabletTaggingContent() {
  const searchParams = useSearchParams();
  const deviceType = (searchParams.get("device") as "ipad" | "mac") || "ipad";
  const location = searchParams.get("location") || "교실 A";

  return <TabletTaggingInterface deviceType={deviceType} location={location} />;
}

export default function TabletTaggingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TabletTaggingContent />
    </Suspense>
  );
}
