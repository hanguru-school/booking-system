'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Calendar, Users, ArrowRight } from 'lucide-react';

interface FormData {
  // 학생 기본 정보
  nameKanji: string;
  nameYomigana: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  phone: string;
  email: string;
  
  // 긴급연락처 정보
  emergencyContactName: string;
  emergencyContactYomigana: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
}

export default function EnrollmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nameKanji: '',
    nameYomigana: '',
    birthYear: '',
    birthMonth: '1',
    birthDay: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactYomigana: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactEmail: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState<string>('');

  // 년도, 월, 일 옵션 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 미성년자 여부 확인 (고등학생까지 = 18세 이하)
  const isMinor = (): boolean => {
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      return false;
    }
    
    const birthYear = parseInt(formData.birthYear);
    const birthMonth = parseInt(formData.birthMonth);
    const birthDay = parseInt(formData.birthDay);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    let age = currentYear - birthYear;
    
    // 생일이 아직 지나지 않았으면 나이에서 1 빼기
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    
    return age <= 18;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 생년월일 숫자만 입력 허용
    if (name === 'birthYear' || name === 'birthDay') {
      // 숫자만 허용
      if (value && !/^\d+$/.test(value)) {
        return;
      }
      // 년도는 4자리, 일은 2자리로 제한
      if (name === 'birthYear' && value.length > 4) {
        return;
      }
      if (name === 'birthDay' && value.length > 2) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 학생 정보 검증
    if (!formData.nameKanji.trim()) newErrors.nameKanji = '漢字氏名を入力してください';
    if (!formData.nameYomigana.trim()) newErrors.nameYomigana = 'よみがな氏名を入力してください';
    
    // 생년월일 검증
    if (!formData.birthYear.trim()) {
      newErrors.birthYear = '生年を入力してください';
    } else {
      const year = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.birthYear = '有効な生年を入力してください';
      }
    }
    
    if (!formData.birthMonth) {
      newErrors.birthMonth = '生月を選択してください';
    }
    
    if (!formData.birthDay.trim()) {
      newErrors.birthDay = '生日を入力してください';
    } else {
      const day = parseInt(formData.birthDay);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.birthDay = '有効な生日を入力してください（1-31）';
      }
    }
    
    if (!formData.phone.trim()) newErrors.phone = '電話番号を入力してください';
    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';

    // 긴급연락처 정보 검증
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = '緊急連絡先氏名を入力してください';
    if (!formData.emergencyContactYomigana.trim()) newErrors.emergencyContactYomigana = '緊急連絡先よみがなを入力してください';
    if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = '続柄を選択してください';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = '緊急連絡先電話番号を入力してください';
    if (!formData.emergencyContactEmail.trim()) newErrors.emergencyContactEmail = '緊急連絡先メールアドレスを入力してください';

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    if (formData.emergencyContactEmail && !emailRegex.test(formData.emergencyContactEmail)) {
      newErrors.emergencyContactEmail = '有効なメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 생년월일을 ISO 형식으로 변환
      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
      
      // 중복 체크
      const duplicateCheckResponse = await fetch('/api/students/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          nameKanji: formData.nameKanji,
          birthDate: birthDate,
        }),
      });

      if (!duplicateCheckResponse.ok) {
        throw new Error('중복 체크에 실패했습니다.');
      }

      const duplicateCheckData = await duplicateCheckResponse.json();
      
      if (duplicateCheckData.isDuplicate && duplicateCheckData.errors && duplicateCheckData.errors.length > 0) {
        // 중복 오류 팝업 표시
        const errorMessage = duplicateCheckData.errors.join('\n');
        alert(`以下の情報が既に登録されています：\n\n${errorMessage}\n\n別の情報を入力してください。`);
        setLoading(false);
        return;
      }
      
      // 학번 자동 생성
      const studentIdResponse = await fetch('/api/students/generate-student-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!studentIdResponse.ok) {
        throw new Error('학번 생성에 실패했습니다.');
      }
      
      const studentIdData = await studentIdResponse.json();
      const generatedStudentId = studentIdData.studentId;
      
      // 생성된 학번을 상태에 저장
      setGeneratedStudentId(generatedStudentId);
      
      // 입회 정보를 localStorage에 저장
      const enrollmentData = {
        ...formData,
        birthDate: birthDate,
        studentId: generatedStudentId,
        submittedAt: new Date().toISOString()
      };
      
      // localStorage 안전성 검사
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('enrollmentData', JSON.stringify(enrollmentData));
        // 규정 동의서 페이지로 이동
        router.push('/rules');
      } else {
        alert('ブラウザがlocalStorageをサポートしていません。');
      }
    } catch (error) {
      console.error('입회 데이터 저장 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`データ保存中にエラーが発生しました：${errorMessage}\n\n再度お試しください。`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">入会申し込み</h1>
          <p className="text-gray-600">個人情報を入力してください</p>
        </div>

        {/* 폼 */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 학생 기본 정보 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                学生情報
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    漢字氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nameKanji"
                    value={formData.nameKanji}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nameKanji ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: 田中太郎"
                  />
                  {errors.nameKanji && (
                    <p className="text-red-500 text-sm mt-1">{errors.nameKanji}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    よみがな氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nameYomigana"
                    value={formData.nameYomigana}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nameYomigana ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: タナカタロウ"
                  />
                  {errors.nameYomigana && (
                    <p className="text-red-500 text-sm mt-1">{errors.nameYomigana}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生年月日 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleInputChange}
                        placeholder="年"
                        maxLength={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                          errors.birthYear ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: 'white', color: 'black' }}
                      />
                      {errors.birthYear && (
                        <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>
                      )}
                    </div>
                    <select
                      name="birthMonth"
                      value={formData.birthMonth}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                        errors.birthMonth ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: 'white', color: 'black' }}
                    >
                      {months.map(month => (
                        <option key={month} value={month} style={{ backgroundColor: 'white', color: 'black' }}>{month}月</option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="birthDay"
                        value={formData.birthDay}
                        onChange={handleInputChange}
                        placeholder="日"
                        maxLength={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                          errors.birthDay ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: 'white', color: 'black' }}
                      />
                      {errors.birthDay && (
                        <p className="text-red-500 text-xs mt-1">{errors.birthDay}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: 090-1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: tanaka@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 긴급연락처 정보 / 학부모 정보 */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {isMinor() ? '保護者情報' : '緊急連絡先情報'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMinor() ? '保護者氏名' : '氏名'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={isMinor() ? "例: 田中花子（保護者）" : "例: 田中花子"}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMinor() ? '保護者よみがな' : 'よみがな'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactYomigana"
                    value={formData.emergencyContactYomigana}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactYomigana ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={isMinor() ? "例: タナカハナコ（保護者）" : "例: タナカハナコ"}
                  />
                  {errors.emergencyContactYomigana && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactYomigana}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMinor() ? '続柄（保護者）' : '続柄'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${
                      errors.emergencyContactRelation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: 'white', color: 'black' }}
                  >
                    <option value="" style={{ backgroundColor: 'white', color: 'black' }}>選択してください</option>
                    {isMinor() ? (
                      <>
                        <option value="父" style={{ backgroundColor: 'white', color: 'black' }}>父</option>
                        <option value="母" style={{ backgroundColor: 'white', color: 'black' }}>母</option>
                        <option value="祖父" style={{ backgroundColor: 'white', color: 'black' }}>祖父</option>
                        <option value="祖母" style={{ backgroundColor: 'white', color: 'black' }}>祖母</option>
                        <option value="その他" style={{ backgroundColor: 'white', color: 'black' }}>その他</option>
                      </>
                    ) : (
                      <>
                        <option value="父" style={{ backgroundColor: 'white', color: 'black' }}>父</option>
                        <option value="母" style={{ backgroundColor: 'white', color: 'black' }}>母</option>
                        <option value="配偶者" style={{ backgroundColor: 'white', color: 'black' }}>配偶者</option>
                        <option value="兄弟" style={{ backgroundColor: 'white', color: 'black' }}>兄弟</option>
                        <option value="姉妹" style={{ backgroundColor: 'white', color: 'black' }}>姉妹</option>
                        <option value="祖父" style={{ backgroundColor: 'white', color: 'black' }}>祖父</option>
                        <option value="祖母" style={{ backgroundColor: 'white', color: 'black' }}>祖母</option>
                        <option value="知人" style={{ backgroundColor: 'white', color: 'black' }}>知人</option>
                      </>
                    )}
                  </select>
                  {errors.emergencyContactRelation && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactRelation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMinor() ? '保護者電話番号' : '電話番号'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: 090-9876-5432"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMinor() ? '保護者メールアドレス' : 'メールアドレス'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="emergencyContactEmail"
                    value={formData.emergencyContactEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.emergencyContactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: hanako@example.com"
                  />
                  {errors.emergencyContactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 생성된 학번 표시 */}
            {generatedStudentId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎓 学籍番号が生成されました
                    </h3>
                    <div className="bg-white border border-green-300 rounded-lg px-4 py-2 inline-block">
                      <span className="text-2xl font-mono font-bold text-green-700">
                        {generatedStudentId}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      この学籍番号でログインできます
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    処理中...
                  </>
                ) : (
                  <>
                    次へ進む
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
