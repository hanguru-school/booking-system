"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function AdminPerformancePage() {
  return (
    <ComingSoonPage
      title="성과 관리"
      description="선생님들의 수업 성과, 학생 만족도, 학원 운영 성과 등을 관리할 수 있는 기능입니다."
      backHref="/admin"
      backText="관리자 홈으로"
    />
  );
}
