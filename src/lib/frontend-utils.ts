// 프론트엔드 API 응답 처리 유틸리티

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// API 응답 처리 함수
export async function handleApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      // HTTP 에러 상태 코드 처리
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        // JSON 파싱 실패 시 텍스트로 처리
        errorData = {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          error: "HTTP_ERROR",
        };
      }

      return {
        success: false,
        message: errorData.message || "서버 오류가 발생했습니다.",
        error: errorData.error || "UNKNOWN_ERROR",
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error("API response handling error:", error);
    return {
      success: false,
      message: "응답을 처리하는 중 오류가 발생했습니다.",
      error: error.message || "RESPONSE_PARSING_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}

// 로그인 API 호출 함수
export async function loginUser(
  email: string,
  password: string,
): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return await handleApiResponse(response);
  } catch (error: any) {
    console.error("Login API call error:", error);
    return {
      success: false,
      message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
      error: error.message || "NETWORK_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}

// 세션 확인 API 호출 함수
export async function checkSession(): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/auth/session");
    return await handleApiResponse(response);
  } catch (error: any) {
    console.error("Session check error:", error);
    return {
      success: false,
      message: "세션 확인 중 오류가 발생했습니다.",
      error: error.message || "SESSION_CHECK_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}

// 에러 메시지 표시 함수
export function showErrorMessage(message: string, title: string = "오류") {
  // 브라우저 환경에서만 실행
  if (typeof window !== "undefined") {
    // alert 대신 더 나은 UI 컴포넌트 사용 권장
    alert(`${title}\n\n${message}`);
  }
}

// 성공 메시지 표시 함수
export function showSuccessMessage(message: string, title: string = "성공") {
  // 브라우저 환경에서만 실행
  if (typeof window !== "undefined") {
    alert(`${title}\n\n${message}`);
  }
}

// 로그인 상태 확인 함수
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;

  // 로컬 스토리지에서 토큰 확인
  const token = localStorage.getItem("auth_token");
  return !!token;
}

// 토큰 저장 함수
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

// 토큰 제거 함수
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

// 로그아웃 함수
export function logout(): void {
  removeToken();
  // 추가적인 로그아웃 로직 (예: 서버에 로그아웃 요청)
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}
