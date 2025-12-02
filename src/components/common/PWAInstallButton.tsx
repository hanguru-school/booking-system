"use client";

import { useState, useEffect } from "react";
import { Download, CheckCircle, Smartphone, Monitor } from "lucide-react";

interface PWAInstallButtonProps {
  language?: "ja" | "ko";
  className?: string;
}

export default function PWAInstallButton({
  language = "ja",
  className = "",
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // 이미 설치되었는지 확인
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("PWA 설치 가능 상태 감지됨");
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstalling(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log("PWA 설치 완료");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt || isInstalling) return;

    setIsInstalling(true);

    try {
      // 설치 프롬프트 표시
      const result = await deferredPrompt.prompt();
      console.log("설치 프롬프트 결과:", result);

      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice;
      console.log("사용자 선택 결과:", outcome);

      if (outcome === "accepted") {
        console.log("PWA 설치가 승인되었습니다.");
        // 설치 완료 메시지는 appinstalled 이벤트에서 처리
      } else {
        console.log("PWA 설치가 거부되었습니다.");
        setIsInstalling(false);
        showInstallGuideModal();
      }

      // 프롬프트 초기화
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error("PWA 설치 중 오류:", error);
      setIsInstalling(false);
      showInstallGuideModal();
    }
  };

  const showInstallGuideModal = () => {
    setShowInstallGuide(true);
  };

  const closeInstallGuide = () => {
    setShowInstallGuide(false);
  };

  const getInstallMessage = () => {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
    const isEdge = /Edge|Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    if (platform.includes("Win")) {
      if (isChrome || isEdge) {
        return language === "ja"
          ? "Windows + Chrome/Edge: ブラウザの右上の「インストール」ボタンをクリックしてください"
          : 'Windows + Chrome/Edge: 브라우저 우상단의 "설치" 버튼을 클릭해주세요';
      } else if (isFirefox) {
        return language === "ja"
          ? "Windows + Firefox: アドレスバーの右側の「インストール」ボタンをクリックしてください"
          : 'Windows + Firefox: 주소창 오른쪽의 "설치" 버튼을 클릭해주세요';
      }
    } else if (platform.includes("Mac")) {
      if (isChrome || isEdge) {
        return language === "ja"
          ? "Mac + Chrome/Edge: ブラウザの右上の「インストール」ボタンをクリックしてください"
          : 'Mac + Chrome/Edge: 브라우저 우상단의 "설치" 버튼을 클릭해주세요';
      } else if (isSafari) {
        return language === "ja"
          ? "Mac + Safari: メニューバーの「ファイル」→「このページをアプリケーションとして追加」を選択してください"
          : 'Mac + Safari: 메뉴바의 "파일" → "이 페이지를 애플리케이션으로 추가"를 선택해주세요';
      }
    }

    return language === "ja"
      ? "ブラウザの設定から「ホーム画面に追加」または「インストール」を選択してください"
      : '브라우저 설정에서 "홈 화면에 추가" 또는 "설치"를 선택해주세요';
  };

  // 이미 설치된 경우
  if (isInstalled) {
    return (
      <div className="relative group">
        <button
          className="p-2 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300 transition-all duration-300 shadow-md hover:shadow-lg"
          title={language === "ja" ? "インストール済み" : "설치됨"}
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {/* 툴팁 */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
          {language === "ja" ? "インストール済み" : "설치됨"}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    );
  }

  // 설치 가능한 경우
  if (isInstallable) {
    return (
      <>
        <div className="relative group">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            title={language === "ja" ? "ホーム画面に追加" : "홈 화면에 추가"}
          >
            {isInstalling ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          {/* 툴팁 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
            {language === "ja" ? "ホーム画面に追加" : "홈 화면에 추가"}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
          </div>
        </div>

        {/* 설치 가이드 모달 */}
        {showInstallGuide && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "ja" ? "インストール方法" : "설치 방법"}
                </h3>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                {getInstallMessage()}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={closeInstallGuide}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {language === "ja" ? "閉じる" : "닫기"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 설치 불가능한 경우
  return (
    <div className="relative group">
      <button
        onClick={showInstallGuideModal}
        className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
        title={language === "ja" ? "インストール方法" : "설치 방법"}
      >
        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {/* 툴팁 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
        {language === "ja" ? "インストール方法" : "설치 방법"}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>
  );
}
