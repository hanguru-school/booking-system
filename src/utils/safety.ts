// localStorage 안전성 유틸리티 함수들

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not supported');
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem error:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not supported');
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage.setItem error:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not supported');
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage.removeItem error:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not supported');
        return false;
      }
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('localStorage.clear error:', error);
      return false;
    }
  }
};

// JSON 파싱 안전성 유틸리티
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

// 날짜 포맷팅 유틸리티
export const formatDate = (date: Date, format: 'short' | 'long' = 'short'): string => {
  try {
    if (format === 'short') {
      return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toISOString().split('T')[0];
  }
};

// 파일명 생성 유틸리티
export const generateFileName = (prefix: string, studentName: string, extension: string = 'pdf'): string => {
  try {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // 특수문자 제거
    const cleanName = studentName.replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/g, '');
    
    return `${prefix}_${dateStr}_${cleanName}.${extension}`;
  } catch (error) {
    console.error('File name generation error:', error);
    return `${prefix}_${new Date().toISOString().split('T')[0]}.${extension}`;
  }
};

// 에러 메시지 표준화
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

// 네트워크 요청 안전성 유틸리티
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
