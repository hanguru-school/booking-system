import cache from "./cache";

export interface DeviceSettings {
  type: "mobile" | "tablet" | "desktop";
  uiScale: number;
  layout: "compact" | "normal" | "spacious";
  showAdvancedFeatures: boolean;
  priorityFeatures: string[];
}

export interface LanguageSettings {
  autoDetect: boolean;
  preferredLanguage: "ko" | "ja" | "en" | "zh";
  fallbackLanguage: "ko" | "ja" | "en" | "zh";
}

export interface TimeSettings {
  timezone: string;
  dateFormat: "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY";
  timeFormat: "12h" | "24h";
  autoSync: boolean;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: "immediate" | "daily" | "weekly";
    types: string[];
  };
  line: {
    enabled: boolean;
    frequency: "immediate" | "daily" | "weekly";
    types: string[];
  };
  push: {
    enabled: boolean;
    frequency: "immediate" | "daily" | "weekly";
    types: string[];
  };
  reminders: {
    beforeClass: number; // minutes
    afterClass: number; // hours
    weekly: boolean;
    monthly: boolean;
  };
}

export interface PerformanceSettings {
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  imageCompression: boolean;
  audioCompression: boolean;
  lazyLoading: boolean;
  prefetchEnabled: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  colorBlindMode: boolean;
  reducedMotion: boolean;
  quickAccess: string[];
  pinnedMenus: string[];
}

export interface SystemSettings {
  device: DeviceSettings;
  language: LanguageSettings;
  time: TimeSettings;
  notifications: NotificationSettings;
  performance: PerformanceSettings;
  userPreferences: UserPreferences;
  analytics: {
    enabled: boolean;
    trackUserBehavior: boolean;
    autoOptimize: boolean;
  };
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: SystemSettings;
  private readonly CACHE_KEY = "system_settings";
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private getDefaultSettings(): SystemSettings {
    return {
      device: {
        type: "desktop",
        uiScale: 1.0,
        layout: "normal",
        showAdvancedFeatures: true,
        priorityFeatures: ["booking", "attendance", "payments"],
      },
      language: {
        autoDetect: true,
        preferredLanguage: "ja",
        fallbackLanguage: "en",
      },
      time: {
        timezone: "Asia/Tokyo",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        autoSync: true,
      },
      notifications: {
        email: {
          enabled: true,
          frequency: "immediate",
          types: ["booking", "reminder", "payment", "attendance"],
        },
        line: {
          enabled: true,
          frequency: "immediate",
          types: ["booking", "reminder", "payment", "attendance"],
        },
        push: {
          enabled: true,
          frequency: "immediate",
          types: ["booking", "reminder", "payment", "attendance"],
        },
        reminders: {
          beforeClass: 60, // 1 hour
          afterClass: 24, // 24 hours
          weekly: true,
          monthly: true,
        },
      },
      performance: {
        cacheEnabled: true,
        cacheTTL: 300, // 5 minutes
        imageCompression: true,
        audioCompression: true,
        lazyLoading: true,
        prefetchEnabled: true,
      },
      userPreferences: {
        theme: "auto",
        fontSize: "medium",
        colorBlindMode: false,
        reducedMotion: false,
        quickAccess: [],
        pinnedMenus: [],
      },
      analytics: {
        enabled: true,
        trackUserBehavior: true,
        autoOptimize: true,
      },
    };
  }

  private loadSettings(): void {
    try {
      const cached = cache.get(this.CACHE_KEY);
      if (cached) {
        this.settings = { ...this.getDefaultSettings(), ...cached };
      }
    } catch (error) {
      console.error("설정 로드 실패:", error);
    }
  }

  private saveSettings(): void {
    try {
      cache.set(this.CACHE_KEY, this.settings, this.CACHE_TTL);
    } catch (error) {
      console.error("설정 저장 실패:", error);
    }
  }

  // 기기 타입 감지
  detectDeviceType(): "mobile" | "tablet" | "desktop" {
    if (typeof window === "undefined") return "desktop";

    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  // 브라우저 언어 감지
  detectBrowserLanguage(): string {
    if (typeof window === "undefined") return "ja";

    const language = navigator.language || navigator.languages?.[0] || "ja";
    const langCode = language.split("-")[0];

    return ["ko", "ja", "en", "zh"].includes(langCode) ? langCode : "ja";
  }

  // 시간대 감지
  detectTimezone(): string {
    if (typeof Intl === "undefined") return "Asia/Tokyo";

    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Asia/Tokyo";
    }
  }

  // 설정 업데이트
  updateSettings(updates: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // 특정 설정 업데이트
  updateDeviceSettings(settings: Partial<DeviceSettings>): void {
    this.settings.device = { ...this.settings.device, ...settings };
    this.saveSettings();
  }

  updateLanguageSettings(settings: Partial<LanguageSettings>): void {
    this.settings.language = { ...this.settings.language, ...settings };
    this.saveSettings();
  }

  updateTimeSettings(settings: Partial<TimeSettings>): void {
    this.settings.time = { ...this.settings.time, ...settings };
    this.saveSettings();
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    this.settings.notifications = {
      ...this.settings.notifications,
      ...settings,
    };
    this.saveSettings();
  }

  updatePerformanceSettings(settings: Partial<PerformanceSettings>): void {
    this.settings.performance = { ...this.settings.performance, ...settings };
    this.saveSettings();
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    this.settings.userPreferences = {
      ...this.settings.userPreferences,
      ...preferences,
    };
    this.saveSettings();
  }

  // 설정 조회
  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  getDeviceSettings(): DeviceSettings {
    return { ...this.settings.device };
  }

  getLanguageSettings(): LanguageSettings {
    return { ...this.settings.language };
  }

  getTimeSettings(): TimeSettings {
    return { ...this.settings.time };
  }

  getNotificationSettings(): NotificationSettings {
    return { ...this.settings.notifications };
  }

  getPerformanceSettings(): PerformanceSettings {
    return { ...this.settings.performance };
  }

  getUserPreferences(): UserPreferences {
    return { ...this.settings.userPreferences };
  }

  // 자동 최적화
  autoOptimize(): void {
    const deviceType = this.detectDeviceType();
    const browserLanguage = this.detectBrowserLanguage();
    const timezone = this.detectTimezone();

    // 기기별 최적화
    if (deviceType !== this.settings.device.type) {
      this.updateDeviceSettings({
        type: deviceType,
        uiScale:
          deviceType === "mobile" ? 0.9 : deviceType === "tablet" ? 1.0 : 1.1,
        layout: deviceType === "mobile" ? "compact" : "normal",
        showAdvancedFeatures: deviceType !== "mobile",
        priorityFeatures:
          deviceType === "tablet"
            ? ["booking", "attendance", "notes"]
            : ["booking", "attendance", "payments", "analytics"],
      });
    }

    // 언어 자동 감지
    if (
      this.settings.language.autoDetect &&
      browserLanguage !== this.settings.language.preferredLanguage
    ) {
      this.updateLanguageSettings({
        preferredLanguage: browserLanguage as any,
      });
    }

    // 시간대 자동 감지
    if (
      this.settings.time.autoSync &&
      timezone !== this.settings.time.timezone
    ) {
      this.updateTimeSettings({
        timezone,
      });
    }
  }

  // 설정 백업
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // 설정 복원
  importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      this.settings = { ...this.getDefaultSettings(), ...settings };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error("설정 복원 실패:", error);
      return false;
    }
  }

  // 설정 초기화
  resetSettings(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
  }
}

export const settingsManager = SettingsManager.getInstance();
