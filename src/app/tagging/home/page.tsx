"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  CreditCard,
  Activity,
  BarChart3,
  Wifi,
  WifiOff,
  Plus,
  Edit,
  Trash2,
  Shield,
  AlertCircle,
  Clock,
  Calendar,
  X,
} from "lucide-react";
import Link from "next/link";
import HomeButton from "@/components/common/HomeButton";
import { hardwareReaderManager } from "@/lib/hardware-reader";

interface TaggingResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
  };
  eventType: string;
  message?: string;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: "nfc" | "felica" | "qr";
  status: "online" | "offline" | "error";
  lastSeen: string;
  location: string;
}

interface ICCard {
  id: string;
  uid: string;
  cardType:
    | "student"
    | "teacher"
    | "staff"
    | "visitor"
    | "admin"
    | "super_admin";
  assignedTo?: string;
  status: "active" | "inactive" | "lost";
  registeredAt: string;
  lastUsed?: string;
  notes?: string;
}

interface AuthenticatedUser {
  cardId: string;
  uid: string;
  cardType:
    | "student"
    | "teacher"
    | "staff"
    | "visitor"
    | "admin"
    | "super_admin";
  assignedTo?: string;
  lastTaggingTime: Date;
  permissions: string[];
}

interface PermissionLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  result: "success" | "denied" | "error";
  details: string;
}

export default function TaggingHomePage() {
  const [isTagging, setIsTagging] = useState(false);
  const [currentResult, setCurrentResult] = useState<TaggingResult | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "tagging" | "management" | "cards" | "devices"
  >("tagging");
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [icCards, setIcCards] = useState<ICCard[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalDevices: 0,
    onlineDevices: 0,
    todayTagging: 0,
    weeklyTagging: 0,
  });

  // IC 카드 등록 관련 상태
  const [showCardModal, setShowCardModal] = useState(false);
  const [isReadingCard, setIsReadingCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    uid: "",
    cardType: "student" as
      | "student"
      | "teacher"
      | "staff"
      | "visitor"
      | "admin"
      | "super_admin",
    assignedTo: "",
    status: "active" as "active" | "inactive" | "lost",
    notes: "",
  });
  const [cardFormErrors, setCardFormErrors] = useState<Record<string, string>>(
    {},
  );

  // 일괄 작업 관련 상태
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // 인증 및 권한 시스템 상태
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(
    null,
  );
  const [lastTaggingTime, setLastTaggingTime] = useState<Date | null>(null);
  const [requireReTagging, setRequireReTagging] = useState(false);
  const [permissionLogs, setPermissionLogs] = useState<PermissionLog[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: string;
    resource: string;
    callback: () => void;
  } | null>(null);

  // 테스트용 사용자 선택 상태
  const [selectedTestUser, setSelectedTestUser] =
    useState<string>("ABCD6Y7MZVC1");
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  // 자동 카드 감지 (5초마다 체크, 권한 모달 열려있을 때는 1초마다)
  useEffect(() => {
    if (!autoDetectionEnabled && !showPermissionModal) return;

    const interval = setInterval(
      () => {
        detectCardAutomatically();
      },
      showPermissionModal ? 1000 : 5000,
    ); // 권한 모달 열려있을 때는 1초마다

    return () => clearInterval(interval);
  }, [
    pendingAction,
    autoDetectionEnabled,
    selectedTestUser,
    showPermissionModal,
  ]); // showPermissionModal 의존성 추가

  const loadSystemData = async () => {
    // 시뮬레이션 데이터
    setDevices([
      {
        id: "1",
        name: "메인 출입구 NFC 리더",
        type: "nfc",
        status: "online",
        lastSeen: new Date().toISOString(),
        location: "1층 로비",
      },
      {
        id: "2",
        name: "강의실 FeliCa 리더",
        type: "felica",
        status: "online",
        lastSeen: new Date().toISOString(),
        location: "2층 강의실",
      },
      {
        id: "3",
        name: "사무실 QR 스캐너",
        type: "qr",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        location: "3층 사무실",
      },
    ]);

    setIcCards([
      {
        id: "special-joo",
        uid: "ABCD6Y7MZVC1",
        cardType: "super_admin",
        assignedTo: "주용진",
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T12:00:00Z",
        notes: "시스템 개발자 - 삭제 금지, 변경 불가",
      },
      {
        id: "admin-1",
        uid: "EFGH8N9PQRD2",
        cardType: "admin",
        assignedTo: "김관리자",
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T10:20:00Z",
        notes: "시스템 관리자",
      },
      {
        id: "staff-1",
        uid: "IJKL0Q1RSTU3",
        cardType: "staff",
        assignedTo: "박직원",
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T08:15:00Z",
        notes: "일반 직원",
      },
      {
        id: "teacher-1",
        uid: "MNOP2S3TUVW4",
        cardType: "teacher",
        assignedTo: "이선생님",
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T16:45:00Z",
        notes: "강사",
      },
      {
        id: "student-1",
        uid: "QRST4U5VWXY5",
        cardType: "student",
        assignedTo: "최학생",
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T14:30:00Z",
        notes: "학생",
      },
      {
        id: "visitor-1",
        uid: "UVWX6Y7ZABC6",
        cardType: "visitor",
        assignedTo: undefined,
        status: "active",
        registeredAt: "2024-01-01T09:00:00Z",
        lastUsed: "2024-01-15T13:00:00Z",
        notes: "방문자 카드",
      },
    ]);

    setSystemStats({
      totalCards: 6,
      activeCards: 6,
      totalDevices: 3,
      onlineDevices: 2,
      todayTagging: 47,
      weeklyTagging: 234,
    });

    // 인증 및 권한 시스템 상태
    // setCurrentUser(null); // 실제 사용자 정보 상태
    // setLastTaggingTime(null); // 마지막 태깅 시간 상태
    // setRequireReTagging(false); // 다시 태깅 필요 상태
  };

  // 태그 시작
  const startTagging = async () => {
    setIsTagging(true);
    setCurrentResult(null);

    try {
      // 실제 구현에서는 Web NFC API 또는 하드웨어 리더 사용
      // 여기서는 선택된 테스트 사용자 사용
      setTimeout(() => {
        // 선택된 사용자로 인증 시도
        const authenticatedUser = authenticateUser(selectedTestUser);

        if (authenticatedUser) {
          // 재태깅 필요 여부 확인
          if (checkReTaggingRequired()) {
            setRequireReTagging(true);
            setCurrentResult({
              success: false,
              eventType: "authentication_required",
              message: "30분이 지나 재태깅이 필요합니다.",
            });
          } else {
            setCurrentResult({
              success: true,
              user: {
                id: authenticatedUser.cardId,
                name: authenticatedUser.assignedTo || "Unknown",
              },
              eventType: "authentication_success",
              message: `인증 성공: ${authenticatedUser.assignedTo} (${authenticatedUser.cardType})`,
            });

            // 대기 중인 액션이 있으면 실행
            if (pendingAction) {
              pendingAction.callback();
              setPendingAction(null);
            }
          }
        } else {
          setCurrentResult({
            success: false,
            eventType: "authentication_failed",
            message: "유효하지 않은 카드입니다.",
          });
        }

        setIsTagging(false);
      }, 2000);
    } catch (error) {
      setCurrentResult({
        success: false,
        eventType: "system_error",
        message: "태깅 중 오류가 발생했습니다.",
      });
      setIsTagging(false);
    }
  };

  // 자동 카드 감지 함수
  const detectCardAutomatically = () => {
    // 실제 구현에서는 Web NFC API 사용
    // 여기서는 시뮬레이션으로 주기적으로 카드 감지
    const mockUIDs = [
      "ABCD6Y7MZVC1", // 주용진 (최고 관리자)
      "EFGH8N9PQRD2", // 김관리자 (관리자)
      "IJKL0Q1RSTU3", // 박직원 (직원)
      "MNOP2S3TUVW4", // 이선생님 (강사)
      "QRST4U5VWXY5", // 최학생 (학생)
      "UVWX6Y7ZABC6", // 방문자
    ];

    // 10% 확률로 카드 감지 (실제로는 NFC 리더 이벤트)
    if (Math.random() < 0.1) {
      // 선택된 사용자로 감지 (실제로는 NFC 리더에서 읽은 UID)
      const authenticatedUser = authenticateUser(selectedTestUser);

      if (authenticatedUser) {
        setCurrentResult({
          success: true,
          user: {
            id: authenticatedUser.cardId,
            name: authenticatedUser.assignedTo || "Unknown",
          },
          eventType: "auto_detection_success",
          message: `자동 감지: ${authenticatedUser.assignedTo} (${authenticatedUser.cardType})`,
        });

        // 대기 중인 액션이 있으면 실행
        if (pendingAction) {
          pendingAction.callback();
          setPendingAction(null);
        }
      }
    }
  };

  // 이벤트 타입 한글 변환
  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case "authentication_success":
        return "인증 성공";
      case "authentication_failed":
        return "인증 실패";
      case "authentication_required":
        return "재인증 필요";
      case "auto_detection_success":
        return "자동 감지 성공";
      case "system_error":
        return "시스템 오류";
      default:
        return eventType;
    }
  };

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "offline":
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // IC 카드 등록 관련 함수들
  const openCardModal = () => {
    if (
      !requireAuthentication("create", "cards", () => {
        setShowCardModal(true);
        setCardForm({
          uid: "",
          cardType: "student",
          assignedTo: "",
          status: "active",
          notes: "",
        });
        setCardFormErrors({});
      })
    ) {
      return;
    }
  };

  const closeCardModal = () => {
    setShowCardModal(false);
    setIsReadingCard(false);
  };

  // 실제 카드 UID 읽기 함수
  const readCardUID = async () => {
    setIsReadingCard(true);
    setCardFormErrors({});

    try {
      // 실제 하드웨어 리더 사용
      console.log("실제 하드웨어 리더 연결 시도...");

      const connected = await hardwareReaderManager.connect();
      if (!connected) {
        throw new Error(
          "하드웨어 리더 연결에 실패했습니다. 리더가 연결되어 있는지 확인해주세요.",
        );
      }

      console.log("하드웨어 리더 연결 성공, 카드 읽기 대기 중...");

      // 실제 카드 UID 읽기
      const realUID = await hardwareReaderManager.readUID();

      console.log("실제 카드에서 읽은 UID:", realUID);
      setCardForm((prev) => ({ ...prev, uid: realUID }));
      setIsReadingCard(false);
    } catch (error) {
      console.error("실제 카드 읽기 오류:", error);
      setCardFormErrors({
        uid:
          error instanceof Error
            ? error.message
            : "카드 읽기에 실패했습니다. 다시 시도해주세요.",
      });
      setIsReadingCard(false);
    }
  };

  // 하드웨어 리더 상태
  const [hardwareStatus, setHardwareStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [deviceInfo, setDeviceInfo] = useState<{
    name: string;
    type: string;
    version?: string;
    capabilities?: string[];
    serialNumber?: string;
  } | null>(null);

  // 하드웨어 리더 상태 확인
  const checkHardwareStatus = async () => {
    try {
      setHardwareStatus("connecting");
      const connected = await hardwareReaderManager.connect();
      if (connected) {
        setHardwareStatus("connected");
        const info = await hardwareReaderManager.getDeviceInfo();
        setDeviceInfo(info);
      } else {
        setHardwareStatus("error");
      }
    } catch (error) {
      console.error("하드웨어 상태 확인 실패:", error);
      setHardwareStatus("error");
    }
  };

  const validateCardForm = () => {
    const errors: Record<string, string> = {};

    if (!cardForm.uid.trim()) {
      errors.uid = "UID는 필수입니다.";
    } else if (cardForm.uid.length < 8) {
      errors.uid = "UID는 최소 8자 이상이어야 합니다.";
    }

    if (cardForm.cardType === "student" && !cardForm.assignedTo.trim()) {
      errors.assignedTo = "학생 카드의 경우 할당된 사용자를 입력해주세요.";
    }

    if (cardForm.cardType === "teacher" && !cardForm.assignedTo.trim()) {
      errors.assignedTo = "강사 카드의 경우 할당된 사용자를 입력해주세요.";
    }

    if (cardForm.cardType === "staff" && !cardForm.assignedTo.trim()) {
      errors.assignedTo = "직원 카드의 경우 할당된 사용자를 입력해주세요.";
    }

    if (cardForm.cardType === "admin" && !cardForm.assignedTo.trim()) {
      errors.assignedTo = "관리자 카드의 경우 할당된 사용자를 입력해주세요.";
    }

    if (cardForm.cardType === "super_admin" && !cardForm.assignedTo.trim()) {
      errors.assignedTo =
        "최고 관리자 카드의 경우 할당된 사용자를 입력해주세요.";
    }

    setCardFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCardForm()) {
      return;
    }

    try {
      // 실제 구현에서는 API 호출
      const newCard: ICCard = {
        id: Date.now().toString(),
        uid: cardForm.uid,
        cardType: cardForm.cardType,
        assignedTo: cardForm.assignedTo || undefined,
        status: cardForm.status,
        registeredAt: new Date().toISOString(),
        notes: cardForm.notes,
      };

      setIcCards((prev) => [...prev, newCard]);
      setSystemStats((prev) => ({
        ...prev,
        totalCards: prev.totalCards + 1,
        activeCards: prev.activeCards + (cardForm.status === "active" ? 1 : 0),
      }));

      closeCardModal();

      // 성공 메시지 (실제로는 토스트 알림 사용)
      alert("IC 카드가 성공적으로 등록되었습니다.");
    } catch (error) {
      setCardFormErrors({
        submit: "카드 등록에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  const handleCardFormChange = (field: string, value: string) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
    if (cardFormErrors[field]) {
      setCardFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const deleteCard = (cardId: string) => {
    // 주용진 카드 보호
    if (cardId === "special-joo") {
      alert("주용진 카드는 삭제할 수 없습니다.");
      return;
    }

    if (
      !requireAuthentication("delete", "cards", () => {
        if (confirm("정말로 이 카드를 삭제하시겠습니까?")) {
          const cardToDelete = icCards.find((card) => card.id === cardId);
          setIcCards((prev) => prev.filter((card) => card.id !== cardId));
          setSystemStats((prev) => ({
            ...prev,
            totalCards: prev.totalCards - 1,
            activeCards:
              prev.activeCards - (cardToDelete?.status === "active" ? 1 : 0),
          }));
        }
      })
    ) {
      return;
    }
  };

  const updateCardStatus = (
    cardId: string,
    newStatus: "active" | "inactive" | "lost",
  ) => {
    // 주용진 카드 보호
    if (cardId === "special-joo") {
      alert("주용진 카드의 상태는 변경할 수 없습니다.");
      return;
    }

    if (
      !requireAuthentication("update", "cards", () => {
        setIcCards((prev) =>
          prev.map((card) =>
            card.id === cardId ? { ...card, status: newStatus } : card,
          ),
        );

        // 통계 업데이트
        const card = icCards.find((c) => c.id === cardId);
        if (card) {
          setSystemStats((prev) => ({
            ...prev,
            activeCards:
              prev.activeCards +
              (newStatus === "active" ? 1 : 0) -
              (card.status === "active" ? 1 : 0),
          }));
        }
      })
    ) {
      return;
    }
  };

  // 일괄 작업 관련 함수들
  const toggleCardSelection = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId],
    );
  };

  const selectAllCards = () => {
    setSelectedCards(icCards.map((card) => card.id));
  };

  const deselectAllCards = () => {
    setSelectedCards([]);
  };

  const selectAllDevices = () => {
    setSelectedDevices(devices.map((device) => device.id));
  };

  const deselectAllDevices = () => {
    setSelectedDevices([]);
  };

  const batchDeleteCards = () => {
    if (selectedCards.length === 0) return;

    // 주용진 카드 보호
    if (selectedCards.includes("special-joo")) {
      alert("주용진 카드는 삭제할 수 없습니다. 선택에서 제외됩니다.");
      setSelectedCards((prev) => prev.filter((id) => id !== "special-joo"));
      return;
    }

    if (
      !requireAuthentication("delete", "cards", () => {
        if (
          confirm(`선택된 ${selectedCards.length}개의 카드를 삭제하시겠습니까?`)
        ) {
          const cardsToDelete = icCards.filter((card) =>
            selectedCards.includes(card.id),
          );
          setIcCards((prev) =>
            prev.filter((card) => !selectedCards.includes(card.id)),
          );
          setSystemStats((prev) => ({
            ...prev,
            totalCards: prev.totalCards - selectedCards.length,
            activeCards:
              prev.activeCards -
              cardsToDelete.filter((card) => card.status === "active").length,
          }));
          setSelectedCards([]);
        }
      })
    ) {
      return;
    }
  };

  const batchUpdateCardStatus = (newStatus: "active" | "inactive" | "lost") => {
    if (selectedCards.length === 0) return;

    // 주용진 카드 보호
    if (selectedCards.includes("special-joo")) {
      alert("주용진 카드의 상태는 변경할 수 없습니다. 선택에서 제외됩니다.");
      setSelectedCards((prev) => prev.filter((id) => id !== "special-joo"));
      return;
    }

    if (
      !requireAuthentication("update", "cards", () => {
        const currentActiveCount = icCards.filter(
          (card) => selectedCards.includes(card.id) && card.status === "active",
        ).length;

        const newActiveCount =
          newStatus === "active" ? selectedCards.length : 0;

        setIcCards((prev) =>
          prev.map((card) =>
            selectedCards.includes(card.id)
              ? { ...card, status: newStatus }
              : card,
          ),
        );

        setSystemStats((prev) => ({
          ...prev,
          activeCards: prev.activeCards - currentActiveCount + newActiveCount,
        }));

        setSelectedCards([]);
      })
    ) {
      return;
    }
  };

  const batchDeleteDevices = () => {
    if (selectedDevices.length === 0) return;

    if (
      !requireAuthentication("delete", "devices", () => {
        if (
          confirm(
            `선택된 ${selectedDevices.length}개의 디바이스를 삭제하시겠습니까?`,
          )
        ) {
          setDevices((prev) =>
            prev.filter((device) => !selectedDevices.includes(device.id)),
          );
          setSystemStats((prev) => ({
            ...prev,
            totalDevices: prev.totalDevices - selectedDevices.length,
            onlineDevices: prev.onlineDevices - selectedDevices.length,
          }));
          setSelectedDevices([]);
        }
      })
    ) {
      return;
    }
  };

  // 권한 시스템 함수들
  const getPermissionsByCardType = (cardType: string): string[] => {
    switch (cardType) {
      case "super_admin":
        return ["*"]; // 모든 권한
      case "admin":
        return [
          "admin.dashboard",
          "admin.users",
          "admin.cards",
          "admin.devices",
          "admin.settings",
          "admin.logs",
          "teacher.manage",
          "staff.manage",
        ];
      case "staff":
        return [
          "staff.dashboard",
          "staff.attendance",
          "staff.reports",
          "teacher.view",
        ];
      case "teacher":
        return [
          "teacher.dashboard",
          "teacher.lessons",
          "teacher.students",
          "teacher.notes",
          "teacher.attendance",
        ];
      case "student":
        return [
          "student.dashboard",
          "student.lessons",
          "student.notes",
          "student.reservations",
        ];
      case "visitor":
        return ["visitor.access"];
      default:
        return [];
    }
  };

  const checkPermission = (action: string, resource: string): boolean => {
    if (!currentUser) return false;

    const userPermissions = getPermissionsByCardType(currentUser.cardType);

    // 최고 관리자는 모든 권한
    if (userPermissions.includes("*")) return true;

    // 특정 권한 확인
    const requiredPermission = `${resource}.${action}`;
    return userPermissions.includes(requiredPermission);
  };

  const logPermissionAction = (
    action: string,
    resource: string,
    result: "success" | "denied" | "error",
    details: string = "",
  ) => {
    const log: PermissionLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.cardId || "unknown",
      userName: currentUser?.assignedTo || "unknown",
      action,
      resource,
      result,
      details,
    };

    setPermissionLogs((prev) => [log, ...prev]);

    // 권한 거부 시 모든 관리자에게 통보
    if (result === "denied" && currentUser) {
      notifyAdminsOfUnauthorizedAccess(currentUser, action, resource);
    }
  };

  const notifyAdminsOfUnauthorizedAccess = (
    user: AuthenticatedUser,
    action: string,
    resource: string,
  ) => {
    const adminCards = icCards.filter(
      (card) => card.cardType === "admin" || card.cardType === "super_admin",
    );

    console.log(
      `🚨 권한 없는 접근 시도: ${user.assignedTo} (${user.cardType})`,
    );
    console.log(`   액션: ${action}, 리소스: ${resource}`);
    console.log(`   관리자 ${adminCards.length}명에게 통보됨`);

    // 실제 구현에서는 이메일, SMS, 푸시 알림 등으로 통보
  };

  const requireAuthentication = (
    action: string,
    resource: string,
    callback: () => void,
  ) => {
    if (!currentUser) {
      setPendingAction({ action, resource, callback });
      setShowPermissionModal(true);
      return false;
    }

    if (requireReTagging) {
      setPendingAction({ action, resource, callback });
      setShowPermissionModal(true);
      return false;
    }

    if (!checkPermission(action, resource)) {
      logPermissionAction(action, resource, "denied", "권한 없음");
      alert(`권한이 없습니다.\n액션: ${action}\n리소스: ${resource}`);
      return false;
    }

    logPermissionAction(action, resource, "success");
    callback();
    return true;
  };

  const authenticateUser = (uid: string): AuthenticatedUser | null => {
    const card = icCards.find((c) => c.uid === uid && c.status === "active");
    if (!card) return null;

    const now = new Date();
    const user: AuthenticatedUser = {
      cardId: card.id,
      uid: card.uid,
      cardType: card.cardType,
      assignedTo: card.assignedTo,
      lastTaggingTime: now,
      permissions: getPermissionsByCardType(card.cardType),
    };

    setCurrentUser(user);
    setLastTaggingTime(now);
    setRequireReTagging(false);

    // 카드 마지막 사용 시간 업데이트
    setIcCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, lastUsed: now.toISOString() } : c,
      ),
    );

    return user;
  };

  const checkReTaggingRequired = (): boolean => {
    if (!lastTaggingTime) return true;

    const now = new Date();
    const timeDiff = now.getTime() - lastTaggingTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff > 30;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                태그 시스템
              </h1>
              <p className="text-lg text-gray-600">
                NFC/FeliCa 태그를 통한 출석 및 방문 기록 관리
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 현재 사용자 정보 */}
              {currentUser && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div className="text-sm">
                      <div className="font-medium text-green-900">
                        {currentUser.assignedTo} (
                        {currentUser.cardType === "super_admin"
                          ? "최고 관리자"
                          : currentUser.cardType}
                        )
                      </div>
                      <div className="text-green-700">
                        {lastTaggingTime &&
                          `마지막 태깅: ${lastTaggingTime.toLocaleTimeString()}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <HomeButton variant="header" />
            </div>
          </div>
        </div>

        {/* 시스템 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 카드</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.totalCards}
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 카드</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.activeCards}
                </p>
              </div>
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 디바이스</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.totalDevices}
                </p>
              </div>
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">온라인</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.onlineDevices}
                </p>
              </div>
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 태깅</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.todayTagging}
                </p>
              </div>
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">주간 태깅</p>
                <p className="text-xl font-bold text-gray-900">
                  {systemStats.weeklyTagging}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("tagging")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "tagging"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Tag className="w-5 h-5 mx-auto mb-2" />
              태깅
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "management"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Settings className="w-5 h-5 mx-auto mb-2" />
              관리
            </button>
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "cards"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-2" />
              IC 카드
            </button>
            <button
              onClick={() => setActiveTab("devices")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "devices"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Activity className="w-5 h-5 mx-auto mb-2" />
              디바이스
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* 태깅 탭 */}
          {activeTab === "tagging" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                태그 시작
              </h2>

              {/* 테스트용 사용자 선택 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테스트용 사용자 선택
                </label>
                <select
                  value={selectedTestUser}
                  onChange={(e) => setSelectedTestUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ABCD6Y7MZVC1">주용진 (최고 관리자)</option>
                  <option value="EFGH8N9PQRD2">김관리자 (관리자)</option>
                  <option value="IJKL0Q1RSTU3">박직원 (직원)</option>
                  <option value="MNOP2S3TUVW4">이선생님 (강사)</option>
                  <option value="QRST4U5VWXY5">최학생 (학생)</option>
                  <option value="UVWX6Y7ZABC6">방문자</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  실제 구현에서는 NFC 리더가 자동으로 카드를 감지합니다.
                </p>
              </div>

              {/* 자동 감지 설정 */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      자동 카드 감지
                    </label>
                    <p className="text-xs text-gray-500">
                      카드를 리더에 가져가면 자동으로 감지됩니다 (5초마다 체크)
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAutoDetectionEnabled(!autoDetectionEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoDetectionEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoDetectionEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {autoDetectionEnabled && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✅ 자동 감지 활성화됨 - 카드를 리더에 가져가면 자동으로
                    인증됩니다
                  </p>
                )}
              </div>

              <button
                onClick={startTagging}
                disabled={isTagging}
                className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isTagging ? (
                  <>
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    태그 중...
                  </>
                ) : (
                  <>
                    <Tag className="w-8 h-8" />
                    태그하기
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                NFC/FeliCa 카드를 리더기에 태그해주세요
              </p>

              {/* 실시간 태깅 결과 */}
              {currentResult && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    태깅 결과
                  </h3>
                  <div
                    className={`p-6 rounded-lg border-2 ${
                      currentResult.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {currentResult.success ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <span className="text-xl font-semibold">
                        {currentResult.success ? "태그 성공" : "태그 실패"}
                      </span>
                    </div>

                    {currentResult.user && (
                      <div className="text-center mb-3">
                        <span className="font-medium text-lg">사용자: </span>
                        <span className="text-lg">
                          {currentResult.user.name}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-3">
                      <span className="font-medium text-lg">이벤트: </span>
                      <span className="text-lg">
                        {getEventTypeText(currentResult.eventType)}
                      </span>
                    </div>

                    {currentResult.message && (
                      <div className="text-center text-gray-600">
                        {currentResult.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 관리 탭 */}
          {activeTab === "management" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                태깅 시스템 관리
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/admin/tagging/logs"
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">태깅 이력</h3>
                      <p className="text-sm text-gray-600">태깅 로그 및 통계</p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/tagging/settings"
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">시스템 설정</h3>
                      <p className="text-sm text-gray-600">태깅 시스템 설정</p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/tagging-management"
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">고급 관리</h3>
                      <p className="text-sm text-gray-600">상세 관리 기능</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* IC 카드 탭 */}
          {activeTab === "cards" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  IC 카드 관리
                </h2>
                <button
                  onClick={openCardModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />새 카드 등록
                </button>
              </div>

              {/* 일괄 작업 도구 모음 */}
              {selectedCards.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedCards.length}개 선택됨
                      </span>
                      <button
                        onClick={deselectAllCards}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        선택 해제
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => batchUpdateCardStatus("active")}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        활성화
                      </button>
                      <button
                        onClick={() => batchUpdateCardStatus("inactive")}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        비활성화
                      </button>
                      <button
                        onClick={() => batchUpdateCardStatus("lost")}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        분실 처리
                      </button>
                      <button
                        onClick={batchDeleteCards}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={
                            selectedCards.length === icCards.length &&
                            icCards.length > 0
                          }
                          onChange={
                            selectedCards.length === icCards.length
                              ? deselectAllCards
                              : selectAllCards
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        UID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        타입
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        할당된 사용자
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        상태
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        마지막 사용
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {icCards.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card.id)}
                            onChange={() => toggleCardSelection(card.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {card.uid}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">
                            {card.cardType === "super_admin"
                              ? "최고 관리자"
                              : card.cardType}
                          </span>
                        </td>
                        <td className="py-3 px-4">{card.assignedTo || "-"}</td>
                        <td className="py-3 px-4">
                          <select
                            value={card.status}
                            onChange={(e) =>
                              updateCardStatus(
                                card.id,
                                e.target.value as
                                  | "active"
                                  | "inactive"
                                  | "lost",
                              )
                            }
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getCardStatusColor(card.status)}`}
                          >
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="lost">분실</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {card.lastUsed
                            ? new Date(card.lastUsed).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCard(card.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 디바이스 탭 */}
          {activeTab === "devices" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                디바이스 관리
              </h2>

              {/* 일괄 작업 도구 모음 */}
              {selectedDevices.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedDevices.length}개 선택됨
                      </span>
                      <button
                        onClick={deselectAllDevices}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        선택 해제
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={batchDeleteDevices}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={
                            selectedDevices.length === devices.length &&
                            devices.length > 0
                          }
                          onChange={
                            selectedDevices.length === devices.length
                              ? deselectAllDevices
                              : selectAllDevices
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        디바이스명
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        타입
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        상태
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        위치
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        마지막 연결
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr
                        key={device.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={() => toggleDeviceSelection(device.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium">{device.name}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{device.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getDeviceStatusIcon(device.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                device.status === "online"
                                  ? "bg-green-100 text-green-800"
                                  : device.status === "offline"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {device.status === "online"
                                ? "온라인"
                                : device.status === "offline"
                                  ? "오프라인"
                                  : "오류"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {device.location}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(device.lastSeen).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* IC 카드 등록 모달 */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    IC 카드 등록
                  </h2>
                  <button
                    onClick={closeCardModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCardFormSubmit} className="space-y-4">
                  {/* 하드웨어 리더 상태 */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-blue-800">
                        하드웨어 리더 상태
                      </label>
                      <button
                        type="button"
                        onClick={checkHardwareStatus}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        상태 확인
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          hardwareStatus === "connected"
                            ? "bg-green-500"
                            : hardwareStatus === "connecting"
                              ? "bg-yellow-500"
                              : hardwareStatus === "error"
                                ? "bg-red-500"
                                : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-blue-700">
                        {hardwareStatus === "connected"
                          ? "연결됨"
                          : hardwareStatus === "connecting"
                            ? "연결 중..."
                            : hardwareStatus === "error"
                              ? "연결 오류"
                              : "연결 안됨"}
                      </span>
                    </div>
                    {deviceInfo && (
                      <div className="text-xs text-blue-600">
                        <p>디바이스: {deviceInfo.name}</p>
                        <p>타입: {deviceInfo.type}</p>
                        <p>시리얼: {deviceInfo.serialNumber}</p>
                      </div>
                    )}
                    <p className="text-blue-600 text-xs mt-1">
                      실제 NFC/FeliCa 리더가 연결되어 있어야 합니다
                    </p>
                  </div>

                  {/* UID 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카드 UID
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={cardForm.uid}
                        onChange={(e) =>
                          handleCardFormChange("uid", e.target.value)
                        }
                        placeholder="카드 UID를 입력하거나 읽기 버튼을 클릭하세요"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          cardFormErrors.uid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        readOnly={isReadingCard}
                      />
                      <button
                        type="button"
                        onClick={readCardUID}
                        disabled={isReadingCard}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isReadingCard ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {cardFormErrors.uid && (
                      <p className="text-red-500 text-sm mt-1">
                        {cardFormErrors.uid}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      카드를 리더기에 태그하거나 UID를 직접 입력하세요
                    </p>
                  </div>

                  {/* 카드 타입 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카드 타입
                    </label>
                    <select
                      value={cardForm.cardType}
                      onChange={(e) =>
                        handleCardFormChange("cardType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">학생</option>
                      <option value="teacher">강사</option>
                      <option value="staff">직원</option>
                      <option value="visitor">방문자</option>
                      <option value="admin">관리자</option>
                      <option value="super_admin">최고 관리자</option>
                    </select>
                  </div>

                  {/* 할당된 사용자 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      할당된 사용자{" "}
                      {cardForm.cardType !== "visitor" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={cardForm.assignedTo}
                      onChange={(e) =>
                        handleCardFormChange("assignedTo", e.target.value)
                      }
                      placeholder={
                        cardForm.cardType === "visitor"
                          ? "방문자 카드는 선택사항"
                          : "사용자 이름을 입력하세요"
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cardFormErrors.assignedTo
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {cardFormErrors.assignedTo && (
                      <p className="text-red-500 text-sm mt-1">
                        {cardFormErrors.assignedTo}
                      </p>
                    )}
                  </div>

                  {/* 카드 상태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카드 상태
                    </label>
                    <select
                      value={cardForm.status}
                      onChange={(e) =>
                        handleCardFormChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="lost">분실</option>
                    </select>
                  </div>

                  {/* 메모 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      메모 (선택사항)
                    </label>
                    <textarea
                      value={cardForm.notes}
                      onChange={(e) =>
                        handleCardFormChange("notes", e.target.value)
                      }
                      placeholder="카드에 대한 추가 정보를 입력하세요"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 오류 메시지 */}
                  {cardFormErrors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">
                        {cardFormErrors.submit}
                      </p>
                    </div>
                  )}

                  {/* 버튼 */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeCardModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      카드 등록
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 플로팅 홈 버튼 */}
      <HomeButton variant="floating" />

      {/* 권한 인증 모달 */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  권한 인증 필요
                </h2>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setPendingAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {pendingAction
                    ? `${pendingAction.action} - ${pendingAction.resource}`
                    : "권한 인증"}
                </h3>
                <p className="text-gray-600 mb-4">
                  이 작업을 수행하려면 카드 인증이 필요합니다.
                </p>

                {/* 자동 감지 상태 표시 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-900">
                      카드 감지 대기 중...
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    카드를 리더기에 가져가면 자동으로 인식됩니다
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    startTagging();
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수동 태깅으로 인증
                </button>

                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setPendingAction(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
