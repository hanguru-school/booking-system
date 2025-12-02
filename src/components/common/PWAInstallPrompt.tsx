"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface PWAInstallPromptProps {
  language?: "ja" | "ko";
}

export default function PWAInstallPrompt({
  language = "ko",
}: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const translations = {
    ja: {
      title: "アプリをインストール",
      description:
        "MalMoiをホーム画面に追加して、より便利にご利用いただけます。",
      install: "インストール",
      later: "後で",
      notSupported: "お使いのブラウザはPWAをサポートしていません。",
      alreadyInstalled: "アプリは既にインストールされています。",
    },
    ko: {
      title: "앱을 설치",
      description: "MalMoi를 홈 화면에 추가해서 더 편리하게 사용하세요.",
      install: "설치",
      later: "나중에",
      notSupported: "현재 브라우저는 PWA를 지원하지 않습니다.",
      alreadyInstalled: "앱이 이미 설치되어 있습니다.",
    },
  };

  const t = translations[language];

  useEffect(() => {
    // PWA 설치 가능 여부 확인
    const checkInstallability = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

      // 이미 설치된 경우
      if (isStandalone) {
        setIsInstallable(false);
        return;
      }

      // iOS Safari 또는 Chrome 브라우저에서 설치 가능
      if ((isIOS && isSafari) || isChrome) {
        setIsInstallable(true);
      }
    };

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowPrompt(true);
    };

    // 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      console.log("PWA가 성공적으로 설치되었습니다!");
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    // 초기 확인
    checkInstallability();

    // 이벤트 리스너 등록
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      // Chrome 브라우저의 경우 (모바일/데스크톱 모두)
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("PWA 설치됨");
        } else {
          console.log("PWA 설치 거부됨");
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
        return;
      }

      // iOS Safari의 경우
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

      if (isIOS && isSafari) {
        // iOS에서는 수동 설치 안내
        alert(t.description);
        return;
      }

      // 기타 브라우저
      console.log("PWA 설치를 지원하지 않는 브라우저입니다.");
    } catch (error) {
      console.error("PWA 설치 중 오류:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  // PWA 설치 가능 여부 확인
  const canInstall = () => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    // 이미 설치된 경우
    if (isStandalone) {
      return false;
    }

    // iOS Safari 또는 Chrome 브라우저에서 설치 가능
    return (isIOS && isSafari) || isChrome;
  };

  if (!showPrompt || !canInstall()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Download className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
        {t.description}
      </p>

      <div className="flex space-x-2">
        <button
          onClick={handleInstall}
          data-pwa-install
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {t.install}
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 text-xs py-2 px-3 rounded-md hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
        >
          {t.later}
        </button>
      </div>
    </div>
  );
}
