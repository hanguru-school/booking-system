"use client";

import ComingSoonPage from "@/components/ComingSoonPage";

export default function StudentMaterialsPage() {
  return (
    <ComingSoonPage
      title="추가자료"
      description="학습에 도움이 되는 추가 자료들을 다운로드할 수 있는 기능입니다."
      backHref="/student/home"
      backText="학생 홈으로"
    />
  );
}
