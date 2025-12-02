"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Wifi,
  WifiOff,
  XCircle,
  AlertCircle,
  Loader2,
  Info,
  Search,
  Usb,
  Bluetooth,
} from "lucide-react";
import { hardwareReaderManager } from "@/lib/hardware-reader";

export default function RC380TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [deviceInfo, setDeviceInfo] = useState<{
    name: string;
    type: string;
    vendorId?: number;
    productId?: number;
    serialNumber?: string;
    version?: string;
    capabilities?: string[] | Record<string, unknown>;
  } | null>(null);
  const [lastUID, setLastUID] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<
    {
      name: string;
      type: string;
      vendorId?: number;
      productId?: number;
      serialNumber?: string;
    }[]
  >([]);
  const [isScanning, setIsScanning] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const scanDevices = async () => {
    try {
      setIsScanning(true);
      addLog("사용 가능한 디바이스 스캔 시작...");

      const devices = await hardwareReaderManager.listAvailableDevices();
      setAvailableDevices(devices);

      addLog(`스캔 완료: ${devices.length}개 디바이스 발견`);
      devices.forEach((device) => {
        addLog(`- ${device.name} (${device.type})`);
      });
    } catch (error) {
      addLog(`디바이스 스캔 실패: ${error}`);
    } finally {
      setIsScanning(false);
    }
  };

  const requestSerialPermission = async () => {
    try {
      addLog("Serial 포트 권한 요청...");

      if ("serial" in navigator) {
        const port = await (navigator as any).serial.requestPort({
          filters: [
            {
              usbVendorId: 0x054c, // Sony
              usbProductId: 0x06c3, // RC-S380
            },
          ],
        });

        addLog("Serial 포트 권한 획득 성공!");
        addLog(`포트 정보: ${JSON.stringify(port.getInfo())}`);

        // 권한 획득 후 다시 스캔
        await scanDevices();
      } else {
        addLog("Web Serial API가 지원되지 않습니다.");
      }
    } catch (error) {
      addLog(`Serial 권한 요청 실패: ${error}`);
    }
  };

  const requestHIDPermission = async () => {
    try {
      addLog("HID 디바이스 권한 요청...");

      if ("hid" in navigator) {
        const devices = await (navigator as any).hid.requestDevice({
          filters: [
            {
              vendorId: 0x054c, // Sony
              productId: 0x06c3, // RC-S380
            },
          ],
        });

        addLog(`HID 디바이스 권한 획득 성공! ${devices.length}개 디바이스`);
        devices.forEach((device: any) => {
          addLog(
            `- ${device.productName} (${device.vendorId}:${device.productId})`,
          );
        });

        // 권한 획득 후 다시 스캔
        await scanDevices();
      } else {
        addLog("USB HID API가 지원되지 않습니다.");
      }
    } catch (error) {
      addLog(`HID 권한 요청 실패: ${error}`);
    }
  };

  const requestUSBPermission = async () => {
    try {
      addLog("USB 디바이스 권한 요청...");

      if ("usb" in navigator) {
        const device = await (navigator as any).usb.requestDevice({
          filters: [
            {
              vendorId: 0x054c, // Sony
              productId: 0x06c3, // RC-S380
            },
          ],
        });

        addLog("USB 디바이스 권한 획득 성공!");
        addLog(
          `디바이스: ${device.productName} (${device.vendorId}:${device.productId})`,
        );

        // 권한 획득 후 다시 스캔
        await scanDevices();
      } else {
        addLog("USB API가 지원되지 않습니다.");
      }
    } catch (error) {
      addLog(`USB 권한 요청 실패: ${error}`);
    }
  };

  const connectReader = async () => {
    try {
      setConnectionStatus("connecting");
      addLog("RC-S380 리더 연결 시도...");

      const success = await hardwareReaderManager.connect();

      if (success) {
        setConnectionStatus("connected");
        addLog("RC-S380 리더 연결 성공!");

        // 디바이스 정보 가져오기
        try {
          const info = await hardwareReaderManager.getDeviceInfo();
          setDeviceInfo(info);
          addLog(`디바이스: ${info.name} (${info.type})`);
        } catch (error) {
          addLog("디바이스 정보 가져오기 실패");
        }
      } else {
        setConnectionStatus("error");
        addLog("RC-S380 리더 연결 실패");
      }
    } catch (error) {
      setConnectionStatus("error");
      addLog(`연결 오류: ${error}`);
    }
  };

  const disconnectReader = async () => {
    try {
      await hardwareReaderManager.disconnect();
      setConnectionStatus("disconnected");
      setDeviceInfo(null);
      addLog("RC-S380 리더 연결 해제");
    } catch (error) {
      addLog(`연결 해제 오류: ${error}`);
    }
  };

  const readUID = async () => {
    if (!hardwareReaderManager.isConnected()) {
      setError("리더가 연결되지 않았습니다");
      return;
    }

    try {
      setIsReading(true);
      setError("");
      addLog("카드 읽기 시작...");

      const uid = await hardwareReaderManager.readUID();
      setLastUID(uid);
      addLog(`UID 읽기 성공: ${uid}`);
    } catch (error) {
      setError(`UID 읽기 실패: ${error}`);
      addLog(`UID 읽기 실패: ${error}`);
    } finally {
      setIsReading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // 페이지 로드 시 디바이스 스캔
  useEffect(() => {
    scanDevices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-blue-600" />
            RC-S380 리더기 테스트
          </h1>

          {/* 연결 상태 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${
                    connectionStatus === "connected"
                      ? "text-green-600"
                      : connectionStatus === "connecting"
                        ? "text-yellow-600"
                        : connectionStatus === "error"
                          ? "text-red-600"
                          : "text-gray-600"
                  }`}
                >
                  {connectionStatus === "connected" ? (
                    <Wifi className="w-5 h-5" />
                  ) : connectionStatus === "connecting" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : connectionStatus === "error" ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <WifiOff className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {connectionStatus === "connected"
                      ? "연결됨"
                      : connectionStatus === "connecting"
                        ? "연결 중..."
                        : connectionStatus === "error"
                          ? "연결 오류"
                          : "연결 안됨"}
                  </span>
                </div>

                {deviceInfo && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>{deviceInfo.name}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={scanDevices}
                  disabled={isScanning}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      스캔 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2 inline" />
                      디바이스 스캔
                    </>
                  )}
                </button>

                <button
                  onClick={requestSerialPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Serial 권한
                </button>

                <button
                  onClick={requestHIDPermission}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  HID 권한
                </button>

                <button
                  onClick={requestUSBPermission}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  USB 권한
                </button>

                {connectionStatus === "disconnected" && (
                  <button
                    onClick={connectReader}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    리더 연결
                  </button>
                )}

                {connectionStatus === "connected" && (
                  <>
                    <button
                      onClick={disconnectReader}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      연결 해제
                    </button>
                    <button
                      onClick={readUID}
                      disabled={isReading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isReading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                          읽는 중...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2 inline" />
                          카드 읽기
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 사용 가능한 디바이스 목록 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              사용 가능한 디바이스 ({availableDevices.length}개)
            </h3>
            {availableDevices.length === 0 ? (
              <div className="text-blue-700">감지된 디바이스가 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {availableDevices.map((device, index) => (
                  <div
                    key={index}
                    className="bg-white rounded p-3 border border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {device.type === "usb" ? (
                          <Usb className="w-4 h-4 text-blue-600" />
                        ) : device.type === "bluetooth" ? (
                          <Bluetooth className="w-4 h-4 text-blue-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {device.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {device.type} • {device.version} •{" "}
                            {device.serialNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {device.capabilities.map(
                          (cap: string, capIndex: number) => (
                            <span
                              key={capIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {cap}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 디바이스 정보 */}
          {deviceInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                연결된 디바이스 정보
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">이름:</span>
                  <p className="font-medium">{deviceInfo.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">타입:</span>
                  <p className="font-medium">{deviceInfo.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">버전:</span>
                  <p className="font-medium">{deviceInfo.version}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">시리얼:</span>
                  <p className="font-medium">{deviceInfo.serialNumber}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm text-gray-600">기능:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {deviceInfo.capabilities.map((cap: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 마지막 읽은 UID */}
          {lastUID && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                마지막 읽은 UID
              </h3>
              <div className="bg-white border border-green-300 rounded p-3">
                <code className="text-lg font-mono text-green-800">
                  {lastUID}
                </code>
              </div>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* 로그 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">로그</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              로그 지우기
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">로그가 없습니다...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
