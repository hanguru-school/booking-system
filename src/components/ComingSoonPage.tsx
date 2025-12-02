import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  backHref?: string;
  backText?: string;
}

export default function ComingSoonPage({
  title,
  description = "이 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다!",
  backHref = "/",
  backText = "홈으로 돌아가기",
}: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        {/* 아이콘 */}
        <div className="mb-8">
          <div className="relative">
            <Construction className="w-24 h-24 text-orange-500 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              준비중
            </div>
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

        {/* 설명 */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* 진행 상황 */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <div className="text-sm text-gray-600 mb-3">개발 진행률</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full animate-pulse"
              style={{ width: "65%" }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">65% 완료</div>
        </div>

        {/* 예상 출시일 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="text-sm font-medium text-orange-800 mb-1">
            예상 출시일
          </div>
          <div className="text-lg font-semibold text-orange-900">
            2024년 2월
          </div>
        </div>

        {/* 기능 미리보기 */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            준비 중인 기능들
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                직관적인 사용자 인터페이스
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                실시간 데이터 동기화
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">모바일 최적화</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">고급 기능들</span>
            </div>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>

        {/* 추가 정보 */}
        <div className="mt-8 text-xs text-gray-500">
          <p>문의사항이 있으시면 관리자에게 연락해주세요.</p>
        </div>
      </div>
    </div>
  );
}
