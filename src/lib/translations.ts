export type Language = "ko" | "ja" | "en";

interface TranslationTexts {
  welcome: string;
  student: string;
  logout: string;
  thisMonthClasses: string;
  completed: string;
  upcoming: string;
  currentLevel: string;
  averageScore: string;
  points: string;
  studyStreak: string;
  days: string;
  recentReservations: string;
  recentNotes: string;
  viewAll: string;
  noReservations: string;
  noNotes: string;
  studyMessage: string;
  loginFailed: string;
  networkError: string;
  // 추가된 텍스트들
  login: string;
  register: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  rememberMe: string;
  signIn: string;
  signUp: string;
  backToHome: string;
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  search: string;
  filter: string;
  sort: string;
  refresh: string;
  download: string;
  upload: string;
  settings: string;
  profile: string;
  notifications: string;
  help: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
}

const translations: Record<Language, TranslationTexts> = {
  ko: {
    welcome: "안녕하세요",
    student: "학생",
    logout: "로그아웃",
    thisMonthClasses: "이번 달 수업",
    completed: "완료",
    upcoming: "예정",
    currentLevel: "현재 레벨",
    averageScore: "평균 점수",
    points: "포인트",
    studyStreak: "연속 학습",
    days: "일",
    recentReservations: "최근 예약",
    recentNotes: "최근 노트",
    viewAll: "전체 보기",
    noReservations: "예약 내역이 없습니다",
    noNotes: "노트가 없습니다",
    studyMessage: "오늘도 열심히 공부해봐요!",
    loginFailed: "로그인에 실패했습니다",
    networkError: "네트워크 오류가 발생했습니다",
    // 추가된 텍스트들
    login: "로그인",
    register: "회원가입",
    email: "이메일",
    password: "비밀번호",
    confirmPassword: "비밀번호 확인",
    forgotPassword: "비밀번호를 잊으셨나요?",
    rememberMe: "로그인 상태 유지",
    signIn: "로그인",
    signUp: "회원가입",
    backToHome: "홈으로 돌아가기",
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    cancel: "취소",
    save: "저장",
    edit: "수정",
    delete: "삭제",
    search: "검색",
    filter: "필터",
    sort: "정렬",
    refresh: "새로고침",
    download: "다운로드",
    upload: "업로드",
    settings: "설정",
    profile: "프로필",
    notifications: "알림",
    help: "도움말",
    about: "앱 정보",
    contact: "문의하기",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
  },
  ja: {
    welcome: "こんにちは",
    student: "学生",
    logout: "ログアウト",
    thisMonthClasses: "今月の授業",
    completed: "完了",
    upcoming: "予定",
    currentLevel: "現在のレベル",
    averageScore: "平均点",
    points: "ポイント",
    studyStreak: "連続学習",
    days: "日",
    recentReservations: "最近の予約",
    recentNotes: "最近のノート",
    viewAll: "すべて見る",
    noReservations: "予約履歴がありません",
    noNotes: "ノートがありません",
    studyMessage: "今日も頑張って勉強しましょう！",
    loginFailed: "ログインに失敗しました",
    networkError: "ネットワークエラーが発生しました",
    // 추가된 텍스트들
    login: "ログイン",
    register: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    confirmPassword: "パスワードの確認",
    forgotPassword: "パスワードをお忘れですか？",
    rememberMe: "ログイン状態を維持",
    signIn: "ログイン",
    signUp: "新規登録",
    backToHome: "ホームに戻る",
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    cancel: "キャンセル",
    save: "保存",
    edit: "編集",
    delete: "削除",
    search: "検索",
    filter: "フィルター",
    sort: "ソート",
    refresh: "更新",
    download: "ダウンロード",
    upload: "アップロード",
    settings: "設定",
    profile: "プロフィール",
    notifications: "通知",
    help: "ヘルプ",
    about: "アプリについて",
    contact: "お問い合わせ",
    privacy: "プライバシーポリシー",
    terms: "利用規約",
  },
  en: {
    welcome: "Hello",
    student: "Student",
    logout: "Logout",
    thisMonthClasses: "This Month Classes",
    completed: "Completed",
    upcoming: "Upcoming",
    currentLevel: "Current Level",
    averageScore: "Average Score",
    points: "Points",
    studyStreak: "Study Streak",
    days: "days",
    recentReservations: "Recent Reservations",
    recentNotes: "Recent Notes",
    viewAll: "View All",
    noReservations: "No reservations found",
    noNotes: "No notes found",
    studyMessage: "Keep up the good work today!",
    loginFailed: "Login failed",
    networkError: "Network error occurred",
    // 추가된 텍스트들
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember me",
    signIn: "Sign In",
    signUp: "Sign Up",
    backToHome: "Back to Home",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    download: "Download",
    upload: "Upload",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
    help: "Help",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
};

export function useTranslation(language: Language): TranslationTexts {
  return translations[language] || translations.ko;
}

export function getTranslation(
  language: Language,
  key: keyof TranslationTexts,
): string {
  return translations[language]?.[key] || translations.ko[key] || key;
}
