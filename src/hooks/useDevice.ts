"use client";

import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export function useDevice() {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [userAgent, setUserAgent] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드임을 표시
    setIsClient(true);

    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const currentScreenWidth = window.innerWidth;
      const currentScreenHeight = window.innerHeight;

      // 모바일 디바이스 감지 (더 정확한 키워드)
      const mobileKeywords = [
        "android",
        "iphone",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
        "opera mini",
        "iemobile",
        "phone",
      ];

      // 태블릿 디바이스 감지 (더 정확한 키워드)
      const tabletKeywords = [
        "ipad",
        "tablet",
        "playbook",
        "kindle",
        "android.*tablet",
      ];

      const isMobileDevice = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword),
      );

      const isTabletDevice = tabletKeywords.some((keyword) =>
        userAgent.includes(keyword),
      );

      // 터치 지원 여부 확인 (추가적인 디바이스 판단 요소)
      const hasTouchSupport =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // 화면 크기 기반 추가 감지 (더 정확한 판단)
      let detectedType: DeviceType = "desktop";

      // User Agent가 모바일/태블릿이면 우선 적용
      if (isMobileDevice) {
        detectedType = "mobile";
      } else if (isTabletDevice) {
        detectedType = "tablet";
      } else {
        // User Agent가 데스크톱이면 화면 크기와 터치 지원 여부로 판단
        if (currentScreenWidth < 768) {
          detectedType = hasTouchSupport ? "mobile" : "desktop";
        } else if (currentScreenWidth >= 768 && currentScreenWidth < 1024) {
          detectedType = hasTouchSupport ? "tablet" : "desktop";
        } else {
          detectedType = "desktop";
        }
      }

      setDeviceType(detectedType);
      setIsMobile(detectedType === "mobile");
      setIsTablet(detectedType === "tablet");
      setIsDesktop(detectedType === "desktop");
      setScreenWidth(currentScreenWidth);
      setScreenHeight(currentScreenHeight);
      setUserAgent(navigator.userAgent);
    };

    // 초기 감지
    detectDevice();

    // 화면 크기 변경 시 재감지
    window.addEventListener("resize", detectDevice);

    return () => {
      window.removeEventListener("resize", detectDevice);
    };
  }, []);

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: isClient ? screenWidth : 0,
    screenHeight: isClient ? screenHeight : 0,
    userAgent: isClient ? userAgent : "",
    isClient,
  };
}
