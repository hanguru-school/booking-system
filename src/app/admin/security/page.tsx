"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function AdminSecurityPage() {
  return (
    <ComingSoonPage
      title="보안 관리"
      description="시스템 보안 설정, 사용자 권한 관리, 접근 로그 등을 관리할 수 있는 기능입니다."
      backHref="/admin"
      backText="관리자 홈으로"
    />
  );
}
