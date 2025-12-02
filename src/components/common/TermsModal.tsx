"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  role: "STUDENT" | "PARENT" | "TEACHER" | "STAFF" | "ADMIN";
  language: "ko" | "ja";
}

interface TermsContent {
  title: string;
  content: string;
  agreeText: string;
  cancelText: string;
}

export default function TermsModal({
  isOpen,
  onClose,
  onAgree,
  role,
  language,
}: TermsModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);

  const termsContent: Record<string, TermsContent> = {
    ko: {
      title: "회원 약관",
      content: getTermsContent(role, "ko"),
      agreeText: "동의합니다",
      cancelText: "취소",
    },
    ja: {
      title: "利用規約",
      content: getTermsContent(role, "ja"),
      agreeText: "同意します",
      cancelText: "キャンセル",
    },
  };

  const t = termsContent[language];

  const handleAgree = () => {
    setHasAgreed(true);
    onAgree();
    onClose();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasAgreed(e.target.checked);
    if (e.target.checked) {
      // 체크박스가 체크되면 즉시 동의 처리
      onAgree();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: t.content }} />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="agree-terms"
              checked={hasAgreed}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
              {t.agreeText}
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t.cancelText}
            </button>
            <button
              onClick={handleAgree}
              disabled={!hasAgreed}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.agreeText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTermsContent(role: string, language: "ko" | "ja"): string {
  const terms: Record<"ko" | "ja", Record<string, string>> = {
    ko: {
      STUDENT: `
        <h3>학생 회원 약관</h3>
        <p><strong>제1조 (목적)</strong></p>
        <p>이 약관은 MalMoi 한국어 교실(이하 "교실")이 제공하는 서비스의 이용조건 및 절차, 권리와 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        
        <p><strong>제2조 (정의)</strong></p>
        <p>1. "서비스"란 교실이 제공하는 한국어 학습 관련 모든 서비스를 의미합니다.<br>
        2. "학생"이란 교실에 등록하여 한국어 학습 서비스를 이용하는 회원을 의미합니다.</p>
        
        <p><strong>제3조 (회원가입)</strong></p>
        <p>1. 학생은 본인의 실명으로 회원가입을 해야 합니다.<br>
        2. 회원가입 시 제공하는 정보는 정확하고 완전해야 합니다.<br>
        3. 회원가입 후 교실의 승인을 받아야 서비스를 이용할 수 있습니다.</p>
        
        <p><strong>제4조 (서비스 이용)</strong></p>
        <p>1. 학생은 등록된 수업에 정시에 참여해야 합니다.<br>
        2. 수업 중에는 교사의 지시를 따라야 합니다.<br>
        3. 학습 자료는 개인 학습 목적으로만 사용해야 합니다.</p>
        
        <p><strong>제5조 (금지사항)</strong></p>
        <p>1. 다른 학생의 학습을 방해하는 행위<br>
        2. 교실의 명예를 훼손하는 행위<br>
        3. 불법적인 목적으로 서비스를 이용하는 행위</p>
        
        <p><strong>제6조 (개인정보보호)</strong></p>
        <p>교실은 학생의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보처리방침을 통해 구체적인 처리방법을 안내합니다.</p>
        
        <p><strong>제7조 (면책조항)</strong></p>
        <p>교실은 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
      `,
      PARENT: `
        <h3>학부모 회원 약관</h3>
        <p><strong>제1조 (목적)</strong></p>
        <p>이 약관은 MalMoi 한국어 교실(이하 "교실")이 제공하는 서비스의 이용조건 및 절차, 권리와 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        
        <p><strong>제2조 (정의)</strong></p>
        <p>1. "서비스"란 교실이 제공하는 한국어 학습 관련 모든 서비스를 의미합니다.<br>
        2. "학부모"란 교실에 등록된 학생의 법정대리인을 의미합니다.</p>
        
        <p><strong>제3조 (회원가입)</strong></p>
        <p>1. 학부모는 본인의 실명으로 회원가입을 해야 합니다.<br>
        2. 회원가입 시 학생의 이메일을 정확히 입력해야 합니다.<br>
        3. 학부모 계정은 해당 학생과 연동됩니다.</p>
        
        <p><strong>제4조 (권한 및 의무)</strong></p>
        <p>1. 학부모는 학생의 학습 현황을 확인할 수 있습니다.<br>
        2. 학생의 결제 및 예약 관련 업무를 대리할 수 있습니다.<br>
        3. 학생의 개인정보 변경에 동의할 수 있습니다.</p>
        
        <p><strong>제5조 (학부모의 의무)</strong></p>
        <p>1. 학생의 학습을 지원하고 격려해야 합니다.<br>
        2. 교실과의 원활한 소통을 위해 연락처를 정확히 유지해야 합니다.<br>
        3. 학생의 학습 환경을 조성하는데 협조해야 합니다.</p>
        
        <p><strong>제6조 (개인정보보호)</strong></p>
        <p>교실은 학부모와 학생의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보처리방침을 통해 구체적인 처리방법을 안내합니다.</p>
        
        <p><strong>제7조 (면책조항)</strong></p>
        <p>교실은 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
      `,
      TEACHER: `
        <h3>강사 회원 약관</h3>
        <p><strong>제1조 (목적)</strong></p>
        <p>이 약관은 MalMoi 한국어 교실(이하 "교실")이 제공하는 서비스의 이용조건 및 절차, 권리와 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        
        <p><strong>제2조 (정의)</strong></p>
        <p>1. "서비스"란 교실이 제공하는 한국어 학습 관련 모든 서비스를 의미합니다.<br>
        2. "강사"란 교실에서 한국어를 가르치는 교직원을 의미합니다.</p>
        
        <p><strong>제3조 (회원가입)</strong></p>
        <p>1. 강사는 본인의 실명으로 회원가입을 해야 합니다.<br>
        2. 회원가입 시 제공하는 정보는 정확하고 완전해야 합니다.<br>
        3. 교실의 승인을 받아야 서비스를 이용할 수 있습니다.</p>
        
        <p><strong>제4조 (강사의 의무)</strong></p>
        <p>1. 학생들에게 양질의 교육을 제공해야 합니다.<br>
        2. 수업 준비를 철저히 하고 정시에 수업을 진행해야 합니다.<br>
        3. 학생들의 학습 진도를 체계적으로 관리해야 합니다.</p>
        
        <p><strong>제5조 (금지사항)</strong></p>
        <p>1. 학생들에게 부적절한 행동을 하는 행위<br>
        2. 교실의 명예를 훼손하는 행위<br>
        3. 업무상 알게 된 정보를 외부에 유출하는 행위</p>
        
        <p><strong>제6조 (개인정보보호)</strong></p>
        <p>교실은 강사의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보처리방침을 통해 구체적인 처리방법을 안내합니다.</p>
        
        <p><strong>제7조 (면책조항)</strong></p>
        <p>교실은 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
      `,
      STAFF: `
        <h3>직원 회원 약관</h3>
        <p><strong>제1조 (목적)</strong></p>
        <p>이 약관은 MalMoi 한국어 교실(이하 "교실")이 제공하는 서비스의 이용조건 및 절차, 권리와 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        
        <p><strong>제2조 (정의)</strong></p>
        <p>1. "서비스"란 교실이 제공하는 한국어 학습 관련 모든 서비스를 의미합니다.<br>
        2. "직원"이란 교실에서 행정업무를 담당하는 교직원을 의미합니다.</p>
        
        <p><strong>제3조 (회원가입)</strong></p>
        <p>1. 직원은 본인의 실명으로 회원가입을 해야 합니다.<br>
        2. 회원가입 시 제공하는 정보는 정확하고 완전해야 합니다.<br>
        3. 교실의 승인을 받아야 서비스를 이용할 수 있습니다.</p>
        
        <p><strong>제4조 (직원의 의무)</strong></p>
        <p>1. 교실의 행정업무를 성실히 수행해야 합니다.<br>
        2. 학생과 학부모에게 친절하고 정확한 서비스를 제공해야 합니다.<br>
        3. 교실의 운영에 필요한 정보를 정확히 관리해야 합니다.</p>
        
        <p><strong>제5조 (금지사항)</strong></p>
        <p>1. 업무상 알게 된 정보를 외부에 유출하는 행위<br>
        2. 교실의 명예를 훼손하는 행위<br>
        3. 업무 외의 목적으로 시스템을 이용하는 행위</p>
        
        <p><strong>제6조 (개인정보보호)</strong></p>
        <p>교실은 직원의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보처리방침을 통해 구체적인 처리방법을 안내합니다.</p>
        
        <p><strong>제7조 (면책조항)</strong></p>
        <p>교실은 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
      `,
      ADMIN: `
        <h3>관리자 회원 약관</h3>
        <p><strong>제1조 (목적)</strong></p>
        <p>이 약관은 MalMoi 한국어 교실(이하 "교실")이 제공하는 서비스의 이용조건 및 절차, 권리와 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        
        <p><strong>제2조 (정의)</strong></p>
        <p>1. "서비스"란 교실이 제공하는 한국어 학습 관련 모든 서비스를 의미합니다.<br>
        2. "관리자"란 교실의 시스템 관리 및 운영을 담당하는 자를 의미합니다.</p>
        
        <p><strong>제3조 (회원가입)</strong></p>
        <p>1. 관리자는 본인의 실명으로 회원가입을 해야 합니다.<br>
        2. 회원가입 시 제공하는 정보는 정확하고 완전해야 합니다.<br>
        3. 마스터 관리자의 승인을 받아야 관리자 권한을 사용할 수 있습니다.</p>
        
        <p><strong>제4조 (관리자의 권한)</strong></p>
        <p>1. 시스템 관리 및 운영에 관한 모든 권한을 가집니다.<br>
        2. 사용자 관리 및 권한 설정을 할 수 있습니다.<br>
        3. 시스템 데이터를 관리하고 백업할 수 있습니다.</p>
        
        <p><strong>제5조 (관리자의 의무)</strong></p>
        <p>1. 시스템의 안정적인 운영을 위해 최선을 다해야 합니다.<br>
        2. 보안에 유의하여 시스템을 관리해야 합니다.<br>
        3. 개인정보보호법을 준수해야 합니다.</p>
        
        <p><strong>제6조 (금지사항)</strong></p>
        <p>1. 권한을 남용하여 시스템을 파괴하는 행위<br>
        2. 개인정보를 외부에 유출하는 행위<br>
        3. 업무 외의 목적으로 시스템을 이용하는 행위</p>
        
        <p><strong>제7조 (면책조항)</strong></p>
        <p>교실은 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</p>
      `,
    },
    ja: {
      STUDENT: `
        <h3>学生会員規約</h3>
        <p><strong>第1条 (目的)</strong></p>
        <p>本規約は、MalMoi韓国語教室（以下「教室」）が提供するサービスの利用条件及び手続き、権利と義務、責任事項等を規定することを目的とします。</p>
        
        <p><strong>第2条 (定義)</strong></p>
        <p>1. 「サービス」とは、教室が提供する韓国語学習関連のすべてのサービスを意味します。<br>
        2. 「学生」とは、教室に登録して韓国語学習サービスを利用する会員を意味します。</p>
        
        <p><strong>第3条 (会員登録)</strong></p>
        <p>1. 学生は本人の実名で会員登録をしなければなりません。<br>
        2. 会員登録時に提供する情報は正確で完全でなければなりません。<br>
        3. 会員登録後、教室の承認を受けてからサービスを利用できます。</p>
        
        <p><strong>第4条 (サービス利用)</strong></p>
        <p>1. 学生は登録された授業に定時に参加しなければなりません。<br>
        2. 授業中は教師の指示に従わなければなりません。<br>
        3. 学習資料は個人学習目的でのみ使用しなければなりません。</p>
        
        <p><strong>第5条 (禁止事項)</strong></p>
        <p>1. 他の学生の学習を妨害する行為<br>
        2. 教室の名誉を毀損する行為<br>
        3. 違法な目的でサービスを利用する行為</p>
        
        <p><strong>第6条 (個人情報保護)</strong></p>
        <p>教室は学生の個人情報を保護するため、関連法令を遵守し、個人情報処理方針を通じて具体的な処理方法を案内します。</p>
        
        <p><strong>第7条 (免責事項)</strong></p>
        <p>教室は天災地変、戦争、その他不可抗力的事由によりサービスを提供できない場合、責任を負いません。</p>
      `,
      PARENT: `
        <h3>保護者会員規約</h3>
        <p><strong>第1条 (目的)</strong></p>
        <p>本規約は、MalMoi韓国語教室（以下「教室」）が提供するサービスの利用条件及び手続き、権利と義務、責任事項等を規定することを目的とします。</p>
        
        <p><strong>第2条 (定義)</strong></p>
        <p>1. 「サービス」とは、教室が提供する韓国語学習関連のすべてのサービスを意味します。<br>
        2. 「保護者」とは、教室に登録された学生の法定代理人を意味します。</p>
        
        <p><strong>第3条 (会員登録)</strong></p>
        <p>1. 保護者は本人の実名で会員登録をしなければなりません。<br>
        2. 会員登録時には学生のメールアドレスを正確に入力しなければなりません。<br>
        3. 保護者アカウントは該当学生と連携されます。</p>
        
        <p><strong>第4条 (権限及び義務)</strong></p>
        <p>1. 保護者は学生の学習状況を確認できます。<br>
        2. 学生の決済及び予約関連業務を代理できます。<br>
        3. 学生の個人情報変更に同意できます。</p>
        
        <p><strong>第5条 (保護者の義務)</strong></p>
        <p>1. 学生の学習を支援し、励まさなければなりません。<br>
        2. 教室との円滑なコミュニケーションのため、連絡先を正確に維持しなければなりません。<br>
        3. 学生の学習環境を構築するのに協力しなければなりません。</p>
        
        <p><strong>第6条 (個人情報保護)</strong></p>
        <p>教室は保護者と学生の個人情報を保護するため、関連法令を遵守し、個人情報処理方針を通じて具体的な処理方法を案内します。</p>
        
        <p><strong>第7条 (免責事項)</strong></p>
        <p>教室は天災地変、戦争、その他不可抗力的事由によりサービスを提供できない場合、責任を負いません。</p>
      `,
      TEACHER: `
        <h3>講師会員規約</h3>
        <p><strong>第1条 (目的)</strong></p>
        <p>本規約は、MalMoi韓国語教室（以下「教室」）が提供するサービスの利用条件及び手続き、権利と義務、責任事項等を規定することを目的とします。</p>
        
        <p><strong>第2条 (定義)</strong></p>
        <p>1. 「サービス」とは、教室が提供する韓国語学習関連のすべてのサービスを意味します。<br>
        2. 「講師」とは、教室で韓国語を教える教職員を意味します。</p>
        
        <p><strong>第3条 (会員登録)</strong></p>
        <p>1. 講師は本人の実名で会員登録をしなければなりません。<br>
        2. 会員登録時に提供する情報は正確で完全でなければなりません。<br>
        3. 教室の承認を受けてからサービスを利用できます。</p>
        
        <p><strong>第4条 (講師の義務)</strong></p>
        <p>1. 学生に質の高い教育を提供しなければなりません。<br>
        2. 授業準備を徹底し、定時に授業を進行しなければなりません。<br>
        3. 学生の学習進度を体系的に管理しなければなりません。</p>
        
        <p><strong>第5条 (禁止事項)</strong></p>
        <p>1. 学生に不適切な行為をする行為<br>
        2. 教室の名誉を毀損する行為<br>
        3. 業務上知り得た情報を外部に漏洩する行為</p>
        
        <p><strong>第6条 (個人情報保護)</strong></p>
        <p>教室は講師の個人情報を保護するため、関連法令を遵守し、個人情報処理方針を通じて具体的な処理方法を案内します。</p>
        
        <p><strong>第7条 (免責事項)</strong></p>
        <p>教室は天災地変、戦争、その他不可抗力的事由によりサービスを提供できない場合、責任を負いません。</p>
      `,
      STAFF: `
        <h3>職員会員規約</h3>
        <p><strong>第1条 (目的)</strong></p>
        <p>本規約は、MalMoi韓国語教室（以下「教室」）が提供するサービスの利用条件及び手続き、権利と義務、責任事項等を規定することを目的とします。</p>
        
        <p><strong>第2条 (定義)</strong></p>
        <p>1. 「サービス」とは、教室が提供する韓国語学習関連のすべてのサービスを意味します。<br>
        2. 「職員」とは、教室で行政業務を担当する教職員を意味します。</p>
        
        <p><strong>第3条 (会員登録)</strong></p>
        <p>1. 職員は本人の実名で会員登録をしなければなりません。<br>
        2. 会員登録時に提供する情報は正確で完全でなければなりません。<br>
        3. 教室の承認を受けてからサービスを利用できます。</p>
        
        <p><strong>第4条 (職員の義務)</strong></p>
        <p>1. 教室の行政業務を誠実に遂行しなければなりません。<br>
        2. 学生と保護者に親切で正確なサービスを提供しなければなりません。<br>
        3. 教室の運営に必要な情報を正確に管理しなければなりません。</p>
        
        <p><strong>第5条 (禁止事項)</strong></p>
        <p>1. 業務上知り得た情報を外部に漏洩する行為<br>
        2. 教室の名誉を毀損する行為<br>
        3. 業務外の目的でシステムを利用する行為</p>
        
        <p><strong>第6条 (個人情報保護)</strong></p>
        <p>教室は職員の個人情報を保護するため、関連法令を遵守し、個人情報処理方針を通じて具体的な処理方法を案内します。</p>
        
        <p><strong>第7条 (免責事項)</strong></p>
        <p>教室は天災地変、戦争、その他不可抗力的事由によりサービスを提供できない場合、責任を負いません。</p>
      `,
      ADMIN: `
        <h3>管理者会員規約</h3>
        <p><strong>第1条 (目的)</strong></p>
        <p>本規約は、MalMoi韓国語教室（以下「教室」）が提供するサービスの利用条件及び手続き、権利と義務、責任事項等を規定することを目的とします。</p>
        
        <p><strong>第2条 (定義)</strong></p>
        <p>1. 「サービス」とは、教室が提供する韓国語学習関連のすべてのサービスを意味します。<br>
        2. 「管理者」とは、教室のシステム管理及び運営を担当する者を意味します。</p>
        
        <p><strong>第3条 (会員登録)</strong></p>
        <p>1. 管理者は本人の実名で会員登録をしなければなりません。<br>
        2. 会員登録時に提供する情報は正確で完全でなければなりません。<br>
        3. マスター管理者の承認を受けてから管理者権限を使用できます。</p>
        
        <p><strong>第4条 (管理者の権限)</strong></p>
        <p>1. システム管理及び運営に関するすべての権限を持ちます。<br>
        2. ユーザー管理及び権限設定をすることができます。<br>
        3. システムデータを管理し、バックアップすることができます。</p>
        
        <p><strong>第5条 (管理者の義務)</strong></p>
        <p>1. システムの安定的な運営のために最善を尽くさなければなりません。<br>
        2. セキュリティに注意してシステムを管理しなければなりません。<br>
        3. 個人情報保護法を遵守しなければなりません。</p>
        
        <p><strong>第6条 (禁止事項)</strong></p>
        <p>1. 権限を濫用してシステムを破壊する行為<br>
        2. 個人情報を外部に漏洩する行為<br>
        3. 業務外の目的でシステムを利用する行為</p>
        
        <p><strong>第7条 (免責事項)</strong></p>
        <p>教室は天災地変、戦争、その他不可抗力的事由によりサービスを提供できない場合、責任を負いません。</p>
      `,
    },
  };

  return terms[language][role] || "";
}
