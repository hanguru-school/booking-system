import ComingSoonPage from "@/components/ComingSoonPage";

export default function StudentWritingPage() {
  return (
    <ComingSoonPage
      title="작문테스트"
      description="한국어 작문 능력을 테스트하고 평가받을 수 있는 기능입니다."
      backHref="/student/home"
      backText="학생 홈으로"
    />
  );
}
