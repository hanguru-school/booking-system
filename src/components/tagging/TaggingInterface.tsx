"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  BarChart3,
} from "lucide-react";
import { taggingSystem, TaggingFlow } from "@/lib/tagging-system";
import { hardwareReaderManager } from "@/lib/hardware-reader";

interface TaggingInterfaceProps {
  deviceId: string;
  deviceType: "desktop" | "tablet" | "mobile";
  onTaggingComplete?: (result: Record<string, unknown>) => void;
}

interface TaggingState {
  isScanning: boolean;
  isProcessing: boolean;
  success?: boolean;
  error?: string;
  flow?: TaggingFlow;
  lastTagTime?: number;
  processingTime?: number;
}

// 성능 최적화를 위한 디바운스 훅
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 애니메이션 최적화를 위한 CSS 클래스
const ANIMATION_CLASSES = {
  scanning: "animate-pulse bg-blue-500",
  processing: "animate-spin bg-yellow-500",
  success: "animate-bounce bg-green-500",
  error: "animate-pulse bg-red-500",
  idle: "bg-gray-300",
};

export default function TaggingInterface({
  deviceId,
  deviceType,
  onTaggingComplete,
}: TaggingInterfaceProps) {
  const [state, setState] = useState<TaggingState>({
    isScanning: false,
    isProcessing: false,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState<{
    message?: string;
    color?: string;
    showOptions?: boolean;
    duration?: number;
  } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "error"
  >("connected");
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageProcessingTime: 0,
    successRate: 100,
    totalTags: 0,
  });

  // 디바운스된 상태 업데이트
  const debouncedState = useDebounce(state, 100);

  // 디바이스 정보 메모이제이션
  const deviceInfo = useMemo(() => {
    const devices = taggingSystem.getDevices();
    return devices.find((d) => d.id === deviceId);
  }, [deviceId]);

  // 연결 상태 모니터링
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = hardwareReaderManager.isConnected();
      setConnectionStatus(isConnected ? "connected" : "disconnected");
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // 성능 메트릭 업데이트
  useEffect(() => {
    const updateMetrics = () => {
      const stats = taggingSystem.getTaggingStats();
      setPerformanceMetrics({
        averageProcessingTime: stats.totalTagging > 0 ? 1500 : 0, // 임시 값
        successRate: stats.successRate,
        totalTags: stats.totalTagging,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // 태깅 처리 함수
  const handleTagging = useCallback(async () => {
    if (state.isScanning || state.isProcessing) {
      return;
    }

    setState((prev) => ({ ...prev, isScanning: true, error: undefined }));

    try {
      // 하드웨어 리더에서 UID 읽기 (타임아웃 설정)
      const uidPromise = hardwareReaderManager.readUID();
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("카드 읽기 시간 초과")), 5000),
      );

      const uid = await Promise.race([uidPromise, timeoutPromise]);
      console.log("읽은 UID:", uid);

      setState((prev) => ({
        ...prev,
        isScanning: false,
        isProcessing: true,
      }));

      // 태깅 시스템에 전송 (타임아웃 설정)
      const responsePromise = fetch("/api/tagging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          deviceId,
          taggingMethod: "nfc", // 기본값
          metadata: {
            ipAddress: "127.0.0.1",
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const timeoutResponsePromise = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("서버 응답 시간 초과")), 3000),
      );

      const response = await Promise.race([
        responsePromise,
        timeoutResponsePromise,
      ]);
      const result = await response.json();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          success: true,
          flow: result.flow,
          processingTime: result.processingTime,
          lastTagTime: Date.now(),
        }));

        // 성공 팝업 표시 (빠른 표시)
        setPopupConfig({
          message: result.flow?.uiConfig?.showSuccessMessage
            ? "태깅이 성공적으로 처리되었습니다!"
            : "처리 완료",
          color: "green",
          duration: Math.min(result.flow?.uiConfig?.autoClose || 2000, 2000), // 최대 2초
        });
        setShowPopup(true);

        // 콜백 호출
        if (onTaggingComplete) {
          onTaggingComplete(result);
        }
      } else {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          success: false,
          error: result.error,
          processingTime: result.processingTime,
        }));

        // 오류 팝업 표시 (빠른 표시)
        setPopupConfig({
          message: result.error || "태깅 처리 중 오류가 발생했습니다.",
          color: "red",
          duration: 3000, // 3초로 단축
        });
        setShowPopup(true);
      }
    } catch (error) {
      console.error("태깅 처리 오류:", error);
      setState((prev) => ({
        ...prev,
        isScanning: false,
        isProcessing: false,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      }));

      // 오류 팝업 표시
      setPopupConfig({
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        color: "red",
        duration: 3000,
      });
      setShowPopup(true);
    }
  }, [state.isScanning, state.isProcessing, deviceId, onTaggingComplete]);

  // 팝업 자동 닫기
  useEffect(() => {
    if (showPopup && popupConfig?.duration) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        setPopupConfig(null);
      }, popupConfig.duration);

      return () => clearTimeout(timer);
    }
  }, [showPopup, popupConfig]);

  // 상태에 따른 애니메이션 클래스
  const getAnimationClass = () => {
    if (state.isScanning) return ANIMATION_CLASSES.scanning;
    if (state.isProcessing) return ANIMATION_CLASSES.processing;
    if (state.success) return ANIMATION_CLASSES.success;
    if (state.error) return ANIMATION_CLASSES.error;
    return ANIMATION_CLASSES.idle;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">태깅 시스템</h2>
        <p className="text-gray-600">{deviceInfo?.name || "태깅 디바이스"}</p>
      </div>

      {/* 연결 상태 */}
      <div className="flex items-center justify-center mb-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            connectionStatus === "connected"
              ? "bg-green-100 text-green-800"
              : connectionStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {connectionStatus === "connected" ? (
            <Wifi className="w-4 h-4" />
          ) : connectionStatus === "error" ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {connectionStatus === "connected"
              ? "연결됨"
              : connectionStatus === "error"
                ? "연결 오류"
                : "연결 중..."}
          </span>
        </div>
      </div>

      {/* 태깅 버튼 */}
      <div className="text-center mb-6">
        <button
          onClick={handleTagging}
          disabled={
            state.isScanning ||
            state.isProcessing ||
            connectionStatus !== "connected"
          }
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            state.isScanning || state.isProcessing
              ? "cursor-not-allowed opacity-75"
              : "hover:scale-105 active:scale-95 cursor-pointer"
          } ${getAnimationClass()}`}
        >
          {state.isScanning ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : state.isProcessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : state.success ? (
            <CheckCircle className="w-12 h-12 text-white" />
          ) : state.error ? (
            <XCircle className="w-12 h-12 text-white" />
          ) : (
            <CreditCard className="w-12 h-12 text-white" />
          )}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          {state.isScanning
            ? "카드를 읽는 중..."
            : state.isProcessing
              ? "처리 중..."
              : state.success
                ? "완료!"
                : state.error
                  ? "오류 발생"
                  : "카드를 태그하세요"}
        </p>
      </div>

      {/* 상태 정보 */}
      {state.processingTime && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500">
            처리 시간: {state.processingTime}ms
          </p>
        </div>
      )}

      {/* 성능 메트릭 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {performanceMetrics.totalTags}
          </div>
          <div className="text-xs text-gray-500">총 태깅</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {performanceMetrics.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">성공률</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {performanceMetrics.averageProcessingTime}ms
          </div>
          <div className="text-xs text-gray-500">평균 처리시간</div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => hardwareReaderManager.connect()}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          재연결
        </button>
        <button
          onClick={() => hardwareReaderManager.enableFallbackMode()}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
        >
          <Settings className="w-3 h-3" />
          테스트 모드
        </button>
        <button
          onClick={() => {
            const status = taggingSystem.getSystemStatus();
            console.log("시스템 상태:", status);
          }}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          <BarChart3 className="w-3 h-3" />
          상태
        </button>
      </div>

      {/* 팝업 */}
      {showPopup && popupConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg p-6 max-w-sm mx-4 text-center ${
              popupConfig.color === "green"
                ? "border-l-4 border-green-500"
                : popupConfig.color === "red"
                  ? "border-l-4 border-red-500"
                  : "border-l-4 border-blue-500"
            }`}
          >
            <div
              className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                popupConfig.color === "green"
                  ? "bg-green-100"
                  : popupConfig.color === "red"
                    ? "bg-red-100"
                    : "bg-blue-100"
              }`}
            >
              {popupConfig.color === "green" ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : popupConfig.color === "red" ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <p className="text-gray-900 mb-4">{popupConfig.message}</p>
            <button
              onClick={() => {
                setShowPopup(false);
                setPopupConfig(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
