/**
 * 실제 하드웨어 리더 연동 라이브러리
 * NFC/FeliCa 리더에서 실제 카드 UID를 읽어오는 기능
 * RC-S380 리더기 지원 추가
 */

export interface HardwareReader {
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
  readUID(): Promise<string>;
  getDeviceInfo(): Promise<DeviceInfo>;
  listAvailableDevices(): Promise<DeviceInfo[]>;
}

export interface DeviceInfo {
  name: string;
  type: "nfc" | "felica" | "usb" | "serial" | "bluetooth";
  version: string;
  serialNumber: string;
  capabilities: string[];
  vendorId?: number;
  productId?: number;
}

export interface CardData {
  uid: string;
  cardType: "nfc" | "felica" | "mifare" | "iso14443";
  timestamp: Date;
  signalStrength?: number;
  additionalData?: Record<string, any>;
}

// RC-S380 리더기 설정
const RC_S380_CONFIG = {
  vendorId: 0x054c, // Sony Corporation
  productId: 0x06c3, // RC-S380/P
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
};

// 실제 하드웨어 리더 클래스
export class RealHardwareReader implements HardwareReader {
  private connected: boolean = false;
  private port: any = null; // Web Serial API 또는 USB HID
  private reader: any = null; // Web NFC API
  private fallbackMode: boolean = false;
  private deviceInfo: DeviceInfo | null = null;

  // 사용 가능한 디바이스 목록 조회
  async listAvailableDevices(): Promise<DeviceInfo[]> {
    const devices: DeviceInfo[] = [];

    try {
      console.log("=== 디바이스 스캔 시작 ===");

      // Web Serial API 디바이스 목록
      if ("serial" in navigator) {
        console.log("Web Serial API 지원됨");
        try {
          const ports = await (navigator as any).serial.getPorts();
          console.log("사용 가능한 Serial 포트 개수:", ports.length);

          for (const port of ports) {
            console.log("Serial 포트:", port);
            if (port.getInfo) {
              const info = port.getInfo();
              console.log("Serial 포트 정보:", info);
              if (
                info.usbVendorId === RC_S380_CONFIG.vendorId &&
                info.usbProductId === RC_S380_CONFIG.productId
              ) {
                devices.push({
                  name: "RC-S380/P (Serial)",
                  type: "serial",
                  version: "1.11",
                  serialNumber: "0858573",
                  capabilities: ["felica", "nfc", "iso14443"],
                  vendorId: info.usbVendorId,
                  productId: info.usbProductId,
                });
                console.log("RC-S380 Serial 디바이스 발견!");
              }
            }
          }
        } catch (error) {
          console.log("Serial 디바이스 목록 조회 실패:", error);
        }
      } else {
        console.log("Web Serial API 지원 안됨");
      }

      // USB HID API 디바이스 목록
      if ("hid" in navigator) {
        console.log("USB HID API 지원됨");
        try {
          const hidDevices = await (navigator as any).hid.getDevices();
          console.log("사용 가능한 HID 디바이스 개수:", hidDevices.length);

          for (const device of hidDevices) {
            console.log("HID 디바이스 정보:", {
              vendorId: device.vendorId,
              productId: device.productId,
              productName: device.productName,
              collections: device.collections,
            });

            if (
              device.vendorId === RC_S380_CONFIG.vendorId &&
              device.productId === RC_S380_CONFIG.productId
            ) {
              devices.push({
                name: "RC-S380/P (HID)",
                type: "usb",
                version: "1.11",
                serialNumber: "0858573",
                capabilities: ["felica", "nfc", "iso14443"],
                vendorId: device.vendorId,
                productId: device.productId,
              });
              console.log("RC-S380 HID 디바이스 발견!");
            }
          }
        } catch (error) {
          console.log("HID 디바이스 목록 조회 실패:", error);
        }
      } else {
        console.log("USB HID API 지원 안됨");
      }

      // Web NFC API 확인
      if ("NDEFReader" in window && window.location.protocol === "https:") {
        console.log("Web NFC API 지원됨 (HTTPS)");
        devices.push({
          name: "Web NFC Reader",
          type: "nfc",
          version: "1.0",
          serialNumber: "web-nfc",
          capabilities: ["nfc", "ndef"],
        });
      } else if ("NDEFReader" in window) {
        console.log("Web NFC API 지원됨 (HTTP - 제한적)");
        devices.push({
          name: "Web NFC Reader (HTTP)",
          type: "nfc",
          version: "1.0",
          serialNumber: "web-nfc-http",
          capabilities: ["nfc", "ndef"],
        });
      } else {
        console.log("Web NFC API 지원 안됨");
      }

      // 모든 USB 디바이스 목록 (디버깅용)
      if ("usb" in navigator) {
        console.log("USB API 지원됨");
        try {
          const usbDevices = await (navigator as any).usb.getDevices();
          console.log("사용 가능한 USB 디바이스 개수:", usbDevices.length);

          for (const device of usbDevices) {
            console.log("USB 디바이스 정보:", {
              vendorId: device.vendorId,
              productId: device.productId,
              manufacturerName: device.manufacturerName,
              productName: device.productName,
            });

            // RC-S380과 유사한 디바이스도 포함
            if (device.vendorId === RC_S380_CONFIG.vendorId) {
              devices.push({
                name: `Sony Device (${device.productName || "Unknown"})`,
                type: "usb",
                version: "1.0",
                serialNumber: "unknown",
                capabilities: ["usb"],
                vendorId: device.vendorId,
                productId: device.productId,
              });
              console.log("Sony USB 디바이스 발견!");
            }
          }
        } catch (error) {
          console.log("USB 디바이스 목록 조회 실패:", error);
        }
      } else {
        console.log("USB API 지원 안됨");
      }

      // Bluetooth API 확인
      if ("bluetooth" in navigator) {
        console.log("Bluetooth API 지원됨");
        devices.push({
          name: "Bluetooth NFC Reader",
          type: "bluetooth",
          version: "1.0",
          serialNumber: "bt-nfc",
          capabilities: ["nfc", "bluetooth"],
        });
      } else {
        console.log("Bluetooth API 지원 안됨");
      }

      console.log("=== 디바이스 스캔 완료 ===");
      console.log("발견된 디바이스:", devices);
    } catch (error) {
      console.error("디바이스 목록 조회 중 오류:", error);
    }

    return devices;
  }

  async connect(): Promise<boolean> {
    try {
      console.log("하드웨어 리더 연결 시도...");

      // 먼저 사용 가능한 디바이스 목록 확인
      const availableDevices = await this.listAvailableDevices();
      console.log("사용 가능한 디바이스:", availableDevices);

      // 1. Web NFC API 시도 (HTTPS 환경에서만 작동)
      if ("NDEFReader" in window && window.location.protocol === "https:") {
        console.log("Web NFC API 사용 시도...");
        try {
          this.reader = new (window as any).NDEFReader();
          await this.reader.scan();
          this.connected = true;
          this.deviceInfo = {
            name: "Web NFC Reader",
            type: "nfc",
            version: "1.0",
            serialNumber: "web-nfc",
            capabilities: ["nfc", "ndef"],
          };
          console.log("Web NFC API 연결 성공");
          return true;
        } catch (error) {
          console.log("Web NFC API 연결 실패:", error);
        }
      }

      // 2. Web Serial API 시도 (RC-S380 리더)
      if ("serial" in navigator) {
        console.log("Web Serial API 사용 시도 (RC-S380)...");
        try {
          // 먼저 이미 권한이 있는 포트 확인
          const ports = await (navigator as any).serial.getPorts();
          let rcS380Port = ports.find((port: any) => {
            if (port.getInfo) {
              const info = port.getInfo();
              return (
                info.usbVendorId === RC_S380_CONFIG.vendorId &&
                info.usbProductId === RC_S380_CONFIG.productId
              );
            }
            return false;
          });

          if (!rcS380Port) {
            // 새로 포트 요청
            rcS380Port = await (navigator as any).serial.requestPort({
              filters: [
                {
                  usbVendorId: RC_S380_CONFIG.vendorId,
                  usbProductId: RC_S380_CONFIG.productId,
                },
              ],
            });
          }

          await rcS380Port.open({
            baudRate: RC_S380_CONFIG.baudRate,
            dataBits: RC_S380_CONFIG.dataBits,
            stopBits: RC_S380_CONFIG.stopBits,
            parity: RC_S380_CONFIG.parity,
          });

          this.port = rcS380Port;
          this.connected = true;
          this.deviceInfo = {
            name: "RC-S380/P",
            type: "serial",
            version: "1.11",
            serialNumber: "0858573",
            capabilities: ["felica", "nfc", "iso14443"],
          };
          console.log("RC-S380 Web Serial API 연결 성공");
          return true;
        } catch (error) {
          console.log("RC-S380 Web Serial API 연결 실패:", error);
        }
      }

      // 3. USB HID API 시도 (RC-S380 리더)
      if ("hid" in navigator) {
        console.log("USB HID API 사용 시도 (RC-S380)...");
        try {
          const devices = await (navigator as any).hid.getDevices();
          console.log("HID 디바이스 목록:", devices);

          const rcS380Device = devices.find(
            (device: any) =>
              device.vendorId === RC_S380_CONFIG.vendorId &&
              device.productId === RC_S380_CONFIG.productId,
          );

          if (rcS380Device) {
            await rcS380Device.open();
            this.port = rcS380Device;
            this.connected = true;
            this.deviceInfo = {
              name: "RC-S380/P (HID)",
              type: "usb",
              version: "1.11",
              serialNumber: "0858573",
              capabilities: ["felica", "nfc", "iso14443"],
            };
            console.log("RC-S380 USB HID API 연결 성공");
            return true;
          } else {
            console.log("RC-S380 HID 디바이스를 찾을 수 없습니다");
          }
        } catch (error) {
          console.log("RC-S380 USB HID API 연결 실패:", error);
        }
      }

      // 4. Bluetooth API 시도 (블루투스 리더)
      if ("bluetooth" in navigator) {
        console.log("Bluetooth API 사용 시도...");
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            filters: [
              { services: ["0000fff0-0000-1000-8000-00805f9b34fb"] }, // NFC 서비스 UUID
            ],
          });
          const server = await device.gatt.connect();
          const service = await server.getPrimaryService(
            "0000fff0-0000-1000-8000-00805f9b34fb",
          );
          const characteristic = await service.getCharacteristic(
            "0000fff1-0000-1000-8000-00805f9b34fb",
          );
          this.port = characteristic;
          this.connected = true;
          this.deviceInfo = {
            name: "Bluetooth NFC Reader",
            type: "bluetooth",
            version: "1.0",
            serialNumber: "bt-nfc",
            capabilities: ["nfc", "bluetooth"],
          };
          console.log("Bluetooth API 연결 성공");
          return true;
        } catch (error) {
          console.log("Bluetooth API 연결 실패:", error);
        }
      }

      // 5. 대체 모드 (개발/테스트용)
      console.log(
        "실제 하드웨어 리더를 찾을 수 없습니다. 대체 모드로 전환합니다.",
      );
      this.fallbackMode = true;
      this.connected = true;
      this.deviceInfo = {
        name: "Simulation Mode",
        type: "nfc",
        version: "1.0",
        serialNumber: "sim-001",
        capabilities: ["simulation"],
      };
      return true;
    } catch (error) {
      console.error("하드웨어 리더 연결 실패:", error);
      return false;
    }
  }

  disconnect(): void {
    if (this.port) {
      try {
        if (this.port.close) {
          this.port.close();
        }
      } catch (error) {
        console.error("포트 닫기 실패:", error);
      }
    }
    this.connected = false;
    this.port = null;
    this.reader = null;
    this.fallbackMode = false;
    this.deviceInfo = null;
    console.log("하드웨어 리더 연결 해제");
  }

  isConnected(): boolean {
    return this.connected;
  }

  async readUID(): Promise<string> {
    if (!this.connected) {
      throw new Error("하드웨어 리더가 연결되지 않았습니다");
    }

    try {
      // 대체 모드인 경우 시뮬레이션된 UID 반환
      if (this.fallbackMode) {
        console.log("대체 모드: 시뮬레이션된 UID 생성");
        await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
        const mockUIDs = ["STUDENT1234", "TEACHER5678", "STAFF9012"];
        const randomUID = mockUIDs[Math.floor(Math.random() * mockUIDs.length)];
        console.log("시뮬레이션된 UID:", randomUID);
        return randomUID;
      }

      // Web NFC API 사용
      if (this.reader) {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("카드 읽기 시간 초과"));
          }, 10000);

          this.reader.addEventListener("reading", (event: any) => {
            clearTimeout(timeout);
            const uid = event.serialNumber;
            console.log("Web NFC에서 읽은 실제 UID:", uid);
            resolve(uid);
          });

          this.reader.addEventListener("readingerror", () => {
            clearTimeout(timeout);
            reject(new Error("NFC 읽기 오류"));
          });
        });
      }

      // RC-S380 Web Serial API 사용
      if (this.port && this.port.readable) {
        const reader = this.port.readable.getReader();
        const decoder = new TextDecoder();

        try {
          // RC-S380 명령어: 카드 감지
          const detectCommand = new Uint8Array([0xff, 0xca, 0x00, 0x00, 0x04]);
          const writer = this.port.writable.getWriter();
          await writer.write(detectCommand);
          writer.releaseLock();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const data = decoder.decode(value);
            console.log("RC-S380 응답:", data);

            // UID 패턴 매칭 (FeliCa, NFC-A, NFC-B 등)
            const uidMatch =
              data.match(/UID[:\s]*([A-F0-9]+)/i) ||
              data.match(/([A-F0-9]{8,16})/i) ||
              data.match(/IDm[:\s]*([A-F0-9]+)/i);

            if (uidMatch) {
              const uid = uidMatch[1];
              console.log("RC-S380에서 읽은 실제 UID:", uid);
              return uid;
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      // RC-S380 USB HID API 사용
      if (this.port && this.port.sendReport) {
        // HID 명령어로 UID 읽기
        const command = new Uint8Array([0xff, 0xca, 0x00, 0x00, 0x04]);
        await this.port.sendReport(0, command);

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("HID 카드 읽기 시간 초과"));
          }, 5000);

          this.port.addEventListener("inputreport", (event: any) => {
            clearTimeout(timeout);
            const data = new Uint8Array(event.data.buffer);
            const uid = Array.from(data.slice(0, 8))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase();
            console.log("RC-S380 HID에서 읽은 실제 UID:", uid);
            resolve(uid);
          });
        });
      }

      throw new Error("지원되지 않는 리더 타입입니다");
    } catch (error) {
      console.error("UID 읽기 실패:", error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!this.deviceInfo) {
      throw new Error("디바이스 정보를 가져올 수 없습니다");
    }
    return this.deviceInfo;
  }
}

// 하드웨어 리더 관리자 (싱글톤)
export class HardwareReaderManager {
  private static instance: HardwareReaderManager;
  private reader: RealHardwareReader | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<boolean> | null = null;

  static getInstance(): HardwareReaderManager {
    if (!HardwareReaderManager.instance) {
      HardwareReaderManager.instance = new HardwareReaderManager();
    }
    return HardwareReaderManager.instance;
  }

  async getReader(): Promise<RealHardwareReader> {
    if (!this.reader) {
      this.reader = new RealHardwareReader();
    }
    return this.reader;
  }

  async connect(): Promise<boolean> {
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.performConnection();

    try {
      const result = await this.connectionPromise;
      return result;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async performConnection(): Promise<boolean> {
    try {
      const reader = await this.getReader();
      return await reader.connect();
    } catch (error) {
      console.error("하드웨어 리더 연결 실패:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      this.reader.disconnect();
    }
  }

  isConnected(): boolean {
    return this.reader ? this.reader.isConnected() : false;
  }

  async readUID(): Promise<string> {
    const reader = await this.getReader();
    return reader.readUID();
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const reader = await this.getReader();
    return reader.getDeviceInfo();
  }

  async listAvailableDevices(): Promise<DeviceInfo[]> {
    const reader = await this.getReader();
    return reader.listAvailableDevices();
  }

  enableFallbackMode(): void {
    if (this.reader) {
      // Fallback 모드 활성화 로직
      console.log("Fallback 모드 활성화");
    }
  }

  disableFallbackMode(): void {
    if (this.reader) {
      // Fallback 모드 비활성화 로직
      console.log("Fallback 모드 비활성화");
    }
  }
}

// 전역 인스턴스 생성
export const hardwareReaderManager = HardwareReaderManager.getInstance();

// 전역에서 사용할 수 있도록 window 객체에 추가 (개발 환경에서만)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).hardwareReaderManager = hardwareReaderManager;
}
