"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Language, getStoredLanguage, getTranslation } from "@/lib/i18n";
import LanguageSelector from "@/components/LanguageSelector";

export default function TermsPage() {
  const [language, setLanguage] = useState<Language>("ko");
  const router = useRouter();

  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    setLanguage(storedLanguage);
  }, []);

  const t = getTranslation(language);

  const handleAgree = () => {
    // 약관 동의 상태를 localStorage에 저장
    localStorage.setItem("termsAgreed", "true");
    // 입회 페이지로 돌아가기
    router.push("/auth/register");
  };

  const handleBack = () => {
    // 약관 동의 상태를 초기화하고 돌아가기
    localStorage.removeItem("termsAgreed");
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.termsAndConditions}
            </h1>
            <LanguageSelector onLanguageChange={setLanguage} />
          </div>

          {/* 약관 동의 안내 메시지 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {language === "ko"
                    ? "입회를 완료하려면 아래 약관을 읽고 동의해주세요."
                    : "会員登録を完了するには、以下の規約をお読みいただき、同意してください。"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {language === "ko"
                    ? "약관에 동의하시면 자동으로 입회 페이지로 돌아가며 약관 동의가 체크됩니다."
                    : "規約に同意すると、自動的に会員登録ページに戻り、規約同意がチェックされます。"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {language === "ko" ? (
              <>
                {/* 1. 서비스 이용약관 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    서비스 이용약관
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    한구루 스쿨 예약 시스템(이하 "서비스")을 이용해 주셔서
                    감사합니다. 본 약관은 서비스 이용과 관련된 권리와 의무를
                    규정합니다.
                  </p>
                </div>

                {/* 2. 입회 및 계정 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </span>
                    입회 및 계정
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        서비스 이용을 위해 정확한 정보로 입회를 해야 합니다.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        계정 정보는 본인이 직접 관리해야 하며, 타인에게 양도할
                        수 없습니다.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        계정 도용이나 무단 사용이 발견되면 즉시 서비스 이용이
                        제한될 수 있습니다.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 3. 예약 서비스 */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-l-4 border-purple-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </span>
                    예약 서비스
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>시설 예약은 선착순으로 처리됩니다.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>예약 취소는 사용 24시간 전까지 가능합니다.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        무단 결석 시 향후 예약에 제한이 있을 수 있습니다.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 4. 개인정보 보호 */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-l-4 border-orange-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </span>
                    개인정보 보호
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    개인정보는 서비스 제공 목적으로만 사용되며, 관련 법령에 따라
                    안전하게 보호됩니다.
                  </p>
                </div>

                {/* 5. 서비스 이용 제한 */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      5
                    </span>
                    서비스 이용 제한
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>
                        서비스 이용 규칙을 위반하는 경우 이용이 제한될 수
                        있습니다.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>시스템에 악영향을 주는 행위는 금지됩니다.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>타인의 권리를 침해하는 행위는 금지됩니다.</span>
                    </li>
                  </ul>
                </div>

                {/* 6. 책임 제한 */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border-l-4 border-gray-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      6
                    </span>
                    책임 제한
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    서비스 제공자는 천재지변, 시스템 장애 등 불가항력적인 사유로
                    인한 서비스 중단에 대해 책임을 지지 않습니다.
                  </p>
                </div>

                {/* 7. 약관 변경 */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border-l-4 border-teal-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      7
                    </span>
                    약관 변경
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    본 약관은 사전 공지 후 변경될 수 있으며, 변경된 약관은 공지
                    즉시 효력이 발생합니다.
                  </p>
                </div>

                {/* 8. 문의 및 연락처 */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      8
                    </span>
                    문의 및 연락처
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    서비스 이용과 관련된 문의사항은 관리자에게 연락해 주시기
                    바랍니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 1. サービス利用規約 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    サービス利用規約
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    ハングルスクール予約システム（以下「サービス」）をご利用いただき、ありがとうございます。
                    本規約は、サービス利用に関連する権利と義務を規定します。
                  </p>
                </div>

                {/* 2. 会員登録及びアカウント */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </span>
                    会員登録及びアカウント
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        サービス利用のため、正確な情報で会員登録を行う必要があります。
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        アカウント情報は本人が直接管理し、第三者に譲渡することはできません。
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        アカウントの不正使用が発見された場合、即座にサービス利用が制限される場合があります。
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 3. 予約サービス */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-l-4 border-purple-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </span>
                    予約サービス
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>施設予約は先着順で処理されます。</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>予約キャンセルは使用24時間前まで可能です。</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3 mt-1 text-lg">
                        •
                      </span>
                      <span>
                        無断欠席の場合、今後の予約に制限が設けられる場合があります。
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 4. 個人情報保護 */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-l-4 border-orange-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </span>
                    個人情報保護
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    個人情報はサービス提供目的でのみ使用され、
                    関連法規に従って安全に保護されます。
                  </p>
                </div>

                {/* 5. サービス利用制限 */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      5
                    </span>
                    サービス利用制限
                  </h2>
                  <ul className="space-y-2 text-gray-700 pl-11">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>
                        サービス利用規則に違反する場合、利用が制限される場合があります。
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>
                        システムに悪影響を与える行為は禁止されています。
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                      <span>
                        第三者の権利を侵害する行為は禁止されています。
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 6. 責任制限 */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border-l-4 border-gray-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      6
                    </span>
                    責任制限
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    サービス提供者は、天災、システム障害等の不可抗力的事由による
                    サービス中断について責任を負いません。
                  </p>
                </div>

                {/* 7. 規約変更 */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border-l-4 border-teal-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      7
                    </span>
                    規約変更
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    本規約は事前通知の上変更される場合があり、
                    変更された規約は通知と同時に効力を発生します。
                  </p>
                </div>

                {/* 8. お問い合わせ及び連絡先 */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      8
                    </span>
                    お問い合わせ及び連絡先
                  </h2>
                  <p className="text-gray-700 leading-relaxed pl-11">
                    サービス利用に関するお問い合わせは、管理者までご連絡ください。
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              ← {language === "ko" ? "입회로 돌아가기" : "入会申し込みに戻る"}
            </button>

            <button
              onClick={handleAgree}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {language === "ko" ? "약관에 동의합니다" : "規約に同意します"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
