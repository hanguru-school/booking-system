"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Monitor,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Target,
  Shield,
  Trophy,
  Zap,
  Smartphone,
  Calendar,
  Globe,
  Tablet,
  Clock,
  Star,
  FileText,
  Video,
  Headphones,
  Award,
  TrendingUp,
  Lightbulb,
  Heart,
  Gift,
  GraduationCap,
  Languages,
  Brain,
} from "lucide-react";

// 디바이스 타입 감지 훅
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};

const translations = {
  ja: {
    siteName: "MalMoi",
    heroTitle: "MalMoiが選ばれる理由",
    heroSubtitle: "体系的なカリキュラムと専門講師陣",
    heroDescription: "初級から上級まで、段階的に実力向上。経験豊富な専門講師による、生徒一人ひとりに合わせた細やかな指導。いつでもどこでも学習可能。",
    startButton: "始める",
    benefitsTitle: "教室で学ぶ生徒たちの特別なメリット",
    benefitsSubtitle: "このシステムを使うことで得られるメリット",
    features: {
      reservation: "簡単な授業予約",
      materials: "授業資料管理",
      progress: "学習進度追跡",
    },
    additionalBenefits: {
      communication: "先生とのコミュニケーション",
      review: "授業レビュー",
      homework: "宿題管理",
    },
    loginCTA: {
      title: "今すぐ始めましょう！",
      subtitle: "専門の先生たちと一緒に楽しい韓国語学習",
      button: "始める",
    },
    detailedMerits: {
      specialBenefits: {
        title: "特別なメリット",
        items: [
          "無料学習資料",
          "24時間サポート",
          "進度管理システム",
          "個人別学習計画",
          "定期的な評価とフィードバック",
        ],
      },
      convenientFeatures: {
        title: "便利な機能",
        items: [
          "モバイルアプリ",
          "自動予約システム",
          "リアルタイム通知",
          "学習履歴管理",
          "先生とのメッセージ",
        ],
      },
      learningAdvantages: {
        title: "学習の利点",
        items: [
          "体系的なカリキュラム",
          "専門講師陣",
          "実践的な会話練習",
          "視覚的な学習結果",
          "安全な学習環境",
        ],
      },
    },
    deviceInfo: {
      mobile: "モバイル対応",
      tablet: "タブレット対応",
      desktop: "デスクトップ対応",
    },
    tabletInfo: "タブレットでも快適に学習",
  },
  ko: {
    siteName: "MalMoi",
    heroTitle: "MalMoi가 선택되는 이유",
    heroSubtitle: "체계적인 커리큘럼과 전문 강사진",
    heroDescription: "초급부터 고급까지, 단계적으로 실력 향상. 경험 풍부한 전문 강사에 의한, 학생 개인별 맞춤형 세심한 지도. 언제든 어디서든 학습 가능.",
    startButton: "시작하기",
    benefitsTitle: "교실에서 수강하는 학생들의 특별한 혜택",
    benefitsSubtitle: "이 시스템을 쓰면 얻을 수 있는 메리트",
    features: {
      reservation: "간편한 수업 예약",
      materials: "수업 자료 관리",
      progress: "학습 진도 추적",
    },
    additionalBenefits: {
      communication: "선생님과 소통",
      review: "수업 리뷰",
      homework: "숙제 관리",
    },
    loginCTA: {
      title: "지금 시작해보세요!",
      subtitle: "전문 선생님들과 함께하는 재미있는 한국어 학습",
      button: "시작하기",
    },
    detailedMerits: {
      specialBenefits: {
        title: "특별한 혜택",
        items: [
          "무료 학습 자료",
          "24시간 지원",
          "진도 관리 시스템",
          "개인별 학습 계획",
          "정기적인 평가와 피드백",
        ],
      },
      convenientFeatures: {
        title: "편리한 기능",
        items: [
          "모바일 앱",
          "자동 예약 시스템",
          "실시간 알림",
          "학습 기록 관리",
          "선생님과 메시지",
        ],
      },
      learningAdvantages: {
        title: "학습의 장점",
        items: [
          "체계적인 커리큘럼",
          "전문 강사진",
          "실전적인 대화 연습",
          "시각적인 학습 결과",
          "안전한 학습 환경",
        ],
      },
    },
    deviceInfo: {
      mobile: "모바일 지원",
      tablet: "태블릿 지원",
      desktop: "데스크톱 지원",
    },
    tabletInfo: "태블릿에서도 편안하게 학습",
  },
};

export default function HomePage() {
  const [language, setLanguage] = useState<'ja' | 'ko'>('ko');
  const router = useRouter();
  const deviceType = useDeviceType();

  const t = translations[language as keyof typeof translations];

  const handleStart = () => {
    // 바로 로그인 페이지로 이동
    router.push('/auth/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'ja' : 'ko');
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-6 h-6" />;
      case 'tablet':
        return <Tablet className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-lg">{t.siteName}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'ko' ? '한국어' : '日本語'}</span>
          </button>
          <div className="flex items-center space-x-2">
            {getDeviceIcon()}
            <span className="text-sm text-gray-600">{t.deviceInfo[deviceType]}</span>
          </div>
        </div>
      </header>

      {/* Top Start Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleStart}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
        >
          {t.startButton}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-700">
            {t.heroSubtitle}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
            {t.heroDescription}
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {t.heroSubtitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <BookOpen className="w-16 h-16 text-blue-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '체계적인 커리큘럼' : '体系的なカリキュラム'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '초급부터 고급까지 단계적 실력 향상' : '初級から上級まで段階的に実力向上'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Users className="w-16 h-16 text-purple-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '전문 강사진' : '専門講師陣'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '경험 풍부한 전문 강사' : '経験豊富な専門講師'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Clock className="w-16 h-16 text-blue-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '언제든 어디서든' : 'いつでもどこでも'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '학습 가능한 환경' : '学習可能な環境'}
              </p>
            </div>
          </div>
        </section>

        {/* Learning Features */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {language === 'ko' ? '실전적인 학습 기능' : '実践的な学習機能'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <MessageSquare className="w-16 h-16 text-green-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '실전 대화 연습' : '実践的な会話練習'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '네이티브처럼 자연스러운 한국어' : 'ネイティブのような自然な韓国語'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <TrendingUp className="w-16 h-16 text-orange-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '학습 결과 시각화' : '学習結果の視覚化'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '정기적인 평가와 피드백' : '定期的な評価とフィードバック'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Shield className="w-16 h-16 text-teal-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '안전한 학습 환경' : '安全な学習環境'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '안심하고 집중할 수 있는 환경' : '安心して集中できる環境'}
              </p>
            </div>
          </div>
        </section>

        {/* Learning Process */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {language === 'ko' ? 'MalMoi의 학습 과정' : 'MalMoiの学習過程'}
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">1</div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">
                  {language === 'ko' ? '기초 탄탄히 다지기' : '基礎をしっかり固める'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' ? '한글부터 기본 문법까지' : 'ハングルから基本文法まで'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">2</div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">
                  {language === 'ko' ? '응용력 강화' : '応用力強化'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' ? '다양한 표현과 어휘 습득' : '多様な表現と語彙習得'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">3</div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">
                  {language === 'ko' ? '고급 레벨' : '上級レベル'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' ? '네이티브 수준의 회화력' : 'ネイティブレベルの会話力'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {language === 'ko' ? '더 많은 혜택' : 'より多くのメリット'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Heart className="w-16 h-16 text-red-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '특별한 혜택' : '特別なメリット'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '무료 학습 자료, 24시간 지원' : '無料学習資料、24時間サポート'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Gift className="w-16 h-16 text-yellow-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '편리한 기능' : '便利な機能'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '모바일 앱, 자동 예약 시스템' : 'モバイルアプリ、自動予約システム'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Award className="w-16 h-16 text-indigo-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3 text-center">
                {language === 'ko' ? '학습의 장점' : '学習の利点'}
              </h3>
              <p className="text-gray-600 text-center">
                {language === 'ko' ? '체계적인 커리큘럼, 전문 강사진' : '体系的なカリキュラム、専門講師陣'}
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Merits */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            {language === 'ko' ? '상세한 혜택 안내' : '詳細なメリット案内'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-2xl mb-6 text-emerald-700 text-center">
                {t.detailedMerits.specialBenefits.title}
              </h3>
              <ul className="space-y-3">
                {t.detailedMerits.specialBenefits.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-2xl mb-6 text-cyan-700 text-center">
                {t.detailedMerits.convenientFeatures.title}
              </h3>
              <ul className="space-y-3">
                {t.detailedMerits.convenientFeatures.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-cyan-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-8 rounded-2xl shadow-lg">
              <h3 className="font-semibold text-2xl mb-6 text-violet-700 text-center">
                {t.detailedMerits.learningAdvantages.title}
              </h3>
              <ul className="space-y-3">
                {t.detailedMerits.learningAdvantages.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-violet-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.loginCTA.title}</h2>
            <p className="text-2xl mb-8 opacity-90">{t.loginCTA.subtitle}</p>
            <div className="mb-6">
              <p className="text-lg opacity-80 mb-4">
                {language === 'ko' ? '아래 버튼을 클릭하면 로그인 페이지로 이동합니다' : '下のボタンをクリックするとログインページに移動します'}
              </p>
              <p className="text-sm opacity-70">
                {language === 'ko' ? '입회 신청을 원하시면 로그인 후 "입회하기" 버튼을 클릭하세요' : '入会申し込みをご希望の場合は、ログイン後に「入会申し込み」ボタンをクリックしてください'}
              </p>
            </div>
            <button
              onClick={handleStart}
              className="bg-white text-blue-800 px-10 py-4 rounded-xl font-semibold text-xl hover:bg-gray-100 transition-all duration-300 mx-auto shadow-lg"
            >
              {t.loginCTA.button}
            </button>
          </div>
        </section>

      </div>

      {/* Bottom Start Button */}
      <div className="flex justify-center pb-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {language === 'ko' ? '준비되셨나요? 아래 버튼을 클릭하세요!' : '準備はできましたか？下のボタンをクリックしてください！'}
          </p>
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            {t.startButton}
          </button>
        </div>
      </div>

      {/* Bottom URL Bar */}
      <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
        app.hanguru.school
      </div>
    </div>
  );
}
