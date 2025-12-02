export type Language = "ko" | "ja";

export interface Translations {
  ko: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    login: string;
    loginWithLine: string;
    registerWithLine: string;
    register: string;
    name: string;
    confirmPassword: string;
    role: string;
    student: string;
    teacher: string;
    staff: string;
    signUp: string;
    signUpInProgress: string;
    loginInProgress: string;
    noAccount: string;
    hasAccount: string;
    goToLogin: string;
    goToRegister: string;
    passwordMismatch: string;
    passwordTooShort: string;
    cardAuth: string;
    cardAuthInProgress: string;
    retry: string;
    authenticating: string;
    seconds: string;
    languageSelect: string;
    korean: string;
    japanese: string;
    emailPassword: string;
    cardAuthentication: string;
    or: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    testAccount: string;
    admin: string;
    testAccountInfo: string;
    cardReader: string;
    authenticationFailed: string;
    retryAfter: string;
    authenticate: string;
    namePlaceholder: string;
    confirmPasswordPlaceholder: string;
    passwordMinLength: string;
    loginFailed: string;
    registrationFailed: string;
    lineLoginFailed: string;
    lineLoginCancelled: string;
    additionalInfo: string;
    enterName: string;
    cancel: string;
    complete: string;
    userInfoSaveFailed: string;
    // 새로운 회원가입 관련 번역
    passwordStrength: string;
    passwordWeak: string;
    passwordMedium: string;
    passwordStrong: string;
    emailInvalid: string;
    nameRequired: string;
    emailRequired: string;
    passwordRequired: string;
    confirmPasswordRequired: string;
    roleRequired: string;
    registrationSuccess: string;
    checkEmail: string;
    emailAlreadyExists: string;
    passwordRequirements: string;
    passwordRequirementsText: string;
    termsAndConditions: string;
    agreeToTerms: string;
    termsRequired: string;
  };
  ja: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    login: string;
    loginWithLine: string;
    registerWithLine: string;
    register: string;
    name: string;
    confirmPassword: string;
    role: string;
    student: string;
    teacher: string;
    staff: string;
    signUp: string;
    signUpInProgress: string;
    loginInProgress: string;
    noAccount: string;
    hasAccount: string;
    goToLogin: string;
    goToRegister: string;
    passwordMismatch: string;
    passwordTooShort: string;
    cardAuth: string;
    cardAuthInProgress: string;
    retry: string;
    authenticating: string;
    seconds: string;
    languageSelect: string;
    korean: string;
    japanese: string;
    emailPassword: string;
    cardAuthentication: string;
    or: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    testAccount: string;
    admin: string;
    testAccountInfo: string;
    cardReader: string;
    authenticationFailed: string;
    retryAfter: string;
    authenticate: string;
    namePlaceholder: string;
    confirmPasswordPlaceholder: string;
    passwordMinLength: string;
    loginFailed: string;
    registrationFailed: string;
    lineLoginFailed: string;
    lineLoginCancelled: string;
    additionalInfo: string;
    enterName: string;
    cancel: string;
    complete: string;
    userInfoSaveFailed: string;
    // 새로운 회원가입 관련 번역
    passwordStrength: string;
    passwordWeak: string;
    passwordMedium: string;
    passwordStrong: string;
    emailInvalid: string;
    nameRequired: string;
    emailRequired: string;
    passwordRequired: string;
    confirmPasswordRequired: string;
    roleRequired: string;
    registrationSuccess: string;
    checkEmail: string;
    emailAlreadyExists: string;
    passwordRequirements: string;
    passwordRequirementsText: string;
    termsAndConditions: string;
    agreeToTerms: string;
    termsRequired: string;
  };
}

export const translations: Translations = {
  ko: {
    title: "로그인",
    subtitle: "한구루 스쿨 예약 시스템",
    email: "이메일",
    password: "비밀번호",
    login: "로그인",
    loginWithLine: "LINE으로 로그인",
    registerWithLine: "LINE으로 회원가입",
    register: "회원가입",
    name: "이름",
    confirmPassword: "비밀번호 확인",
    role: "역할",
    student: "학생",
    teacher: "강사",
    staff: "직원",
    signUp: "회원가입",
    signUpInProgress: "가입 중...",
    loginInProgress: "로그인 중...",
    noAccount: "아직 계정이 없으신가요?",
    hasAccount: "이미 계정이 있으신가요?",
    goToLogin: "로그인하기",
    goToRegister: "가입하기",
    passwordMismatch: "비밀번호가 일치하지 않습니다",
    passwordTooShort: "비밀번호는 최소 6자 이상이어야 합니다",
    cardAuth: "카드 인증",
    cardAuthInProgress: "카드 인증 중...",
    retry: "다시시도",
    authenticating: "인증 중",
    seconds: "초",
    languageSelect: "언어 선택",
    korean: "한국어",
    japanese: "日本語",
    emailPassword: "이메일/비밀번호",
    cardAuthentication: "카드 인증",
    or: "또는",
    emailPlaceholder: "이메일을 입력하세요",
    passwordPlaceholder: "비밀번호를 입력하세요",
    testAccount: "테스트 계정",
    admin: "관리자",
    testAccountInfo: "테스트 계정 정보",
    cardReader: "카드를 리더에 대주세요",
    authenticationFailed: "인증에 실패했습니다",
    retryAfter: "초 후 다시 시도하세요",
    authenticate: "인증하기",
    namePlaceholder: "홍길동",
    confirmPasswordPlaceholder: "비밀번호를 다시 입력하세요",
    passwordMinLength: "최소 6자 이상",
    loginFailed: "로그인에 실패했습니다",
    registrationFailed: "회원가입에 실패했습니다",
    lineLoginFailed: "LINE 로그인에 실패했습니다",
    lineLoginCancelled: "LINE 로그인이 취소되었습니다",
    additionalInfo: "추가 정보",
    enterName: "이름을 입력하세요",
    cancel: "취소",
    complete: "완료",
    userInfoSaveFailed: "사용자 정보 저장에 실패했습니다",
    // 새로운 회원가입 관련 번역
    passwordStrength: "비밀번호 강도",
    passwordWeak: "약한 비밀번호",
    passwordMedium: "보통 비밀번호",
    passwordStrong: "강한 비밀번호",
    emailInvalid: "유효하지 않은 이메일 주소",
    nameRequired: "이름을 입력해야 합니다",
    emailRequired: "이메일을 입력해야 합니다",
    passwordRequired: "비밀번호를 입력해야 합니다",
    confirmPasswordRequired: "비밀번호 확인을 입력해야 합니다",
    roleRequired: "역할을 선택해야 합니다",
    registrationSuccess: "회원가입이 성공적으로 완료되었습니다",
    checkEmail: "이메일을 확인해주세요",
    emailAlreadyExists: "이미 사용 중인 이메일입니다",
    passwordRequirements: "비밀번호 요구사항",
    passwordRequirementsText:
      "비밀번호는 최소 8자 이상이어야 하며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
    termsAndConditions: "약관 및 조건",
    agreeToTerms: "약관에 동의합니다",
    termsRequired: "약관에 동의해야 합니다",
  },
  ja: {
    title: "ログイン",
    subtitle: "ハングルスクール予約システム",
    email: "メールアドレス",
    password: "パスワード",
    login: "ログイン",
    loginWithLine: "LINEでログイン",
    registerWithLine: "LINEで新規登録",
    register: "新規登録",
    name: "お名前",
    confirmPassword: "パスワード確認",
    role: "役割",
    student: "学生",
    teacher: "講師",
    staff: "スタッフ",
    signUp: "新規登録",
    signUpInProgress: "登録中...",
    loginInProgress: "ログイン中...",
    noAccount: "アカウントをお持ちでない方は",
    hasAccount: "すでにアカウントをお持ちの方は",
    goToLogin: "ログイン",
    goToRegister: "新規登録",
    passwordMismatch: "パスワードが一致しません",
    passwordTooShort: "パスワードは6文字以上で入力してください",
    cardAuth: "カード認証",
    cardAuthInProgress: "カード認証中...",
    retry: "再試行",
    authenticating: "認証中",
    seconds: "秒",
    languageSelect: "言語選択",
    korean: "한국어",
    japanese: "日本語",
    emailPassword: "メール/パスワード",
    cardAuthentication: "カード認証",
    or: "または",
    emailPlaceholder: "メールアドレスを入力してください",
    passwordPlaceholder: "パスワードを入力してください",
    testAccount: "テストアカウント",
    admin: "管理者",
    testAccountInfo: "テストアカウント情報",
    cardReader: "カードをリーダーにかざしてください",
    authenticationFailed: "認証に失敗しました",
    retryAfter: "秒後に再試行してください",
    authenticate: "認証する",
    namePlaceholder: "田中太郎",
    confirmPasswordPlaceholder: "パスワードを再入力してください",
    passwordMinLength: "6文字以上",
    loginFailed: "ログインに失敗しました",
    registrationFailed: "新規登録に失敗しました",
    lineLoginFailed: "LINEログインに失敗しました",
    lineLoginCancelled: "LINEログインがキャンセルされました",
    additionalInfo: "追加情報",
    enterName: "名前を入力してください",
    cancel: "キャンセル",
    complete: "完了",
    userInfoSaveFailed: "ユーザー情報の保存に失敗しました",
    // 새로운 회원가입 관련 번역
    passwordStrength: "パスワード強度",
    passwordWeak: "弱いパスワード",
    passwordMedium: "普通のパスワード",
    passwordStrong: "強いパスワード",
    emailInvalid: "無効なメールアドレス",
    nameRequired: "名前を入力する必要があります",
    emailRequired: "メールアドレスを入力する必要があります",
    passwordRequired: "パスワードを入力する必要があります",
    confirmPasswordRequired: "パスワードを再入力する必要があります",
    roleRequired: "役割を選択する必要があります",
    registrationSuccess: "新規登録が正常に完了しました",
    checkEmail: "メールを確認してください",
    emailAlreadyExists: "すでに使用されているメールアドレスです",
    passwordRequirements: "パスワード要件",
    passwordRequirementsText:
      "パスワードは8文字以上で、大文字、小文字、数字、特殊文字を含める必要があります。",
    termsAndConditions: "規約及び条件",
    agreeToTerms: "規約に同意します",
    termsRequired: "規約に同意する必要があります",
  },
};

// 언어 저장/불러오기 함수
export const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "ko";
  return (localStorage.getItem("language") as Language) || "ko";
};

export const setStoredLanguage = (language: Language): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("language", language);
};

// 현재 언어의 번역 가져오기
export const getTranslation = (language: Language) => {
  return translations[language];
};
