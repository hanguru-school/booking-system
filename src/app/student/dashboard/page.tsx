'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, BookOpen, Settings, LogOut, CheckCircle } from 'lucide-react';

interface Student {
  id: string;
  studentId: string;
  nameKanji: string;
  nameYomigana: string;
  birthDate: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactYomigana: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  isFirstLogin: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // localStorage에서 학생 정보 가져오기
      const studentData = localStorage.getItem('student');
      const token = localStorage.getItem('token');
      
      if (!studentData || !token) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }
      
      const parsedStudent = JSON.parse(studentData);
      setStudent(parsedStudent);
      
      // 첫 로그인인 경우 비밀번호 변경 페이지로 이동
      if (parsedStudent.isFirstLogin) {
        router.push('/student/change-password');
        return;
      }
      
    } catch (error) {
      console.error('학생 정보 로드 오류:', error);
      alert('학생 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    try {
      // localStorage 정리
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('student');
        localStorage.removeItem('initialPassword');
      }
      
      alert('로그아웃되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">학생 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">MalMoi Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">안녕하세요, {student.nameKanji}님</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-blue-800">입회 완료!</h2>
              <p className="text-blue-700">
                {student.nameKanji}님의 입회가 성공적으로 완료되었습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 학생 정보 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            학생 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">학생 ID:</span>
                <span className="text-gray-800 font-mono">{student.studentId}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">이름:</span>
                <span className="text-gray-800">{student.nameKanji}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">후리가나:</span>
                <span className="text-gray-800">{student.nameYomigana}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">생년월일:</span>
                <span className="text-gray-800">{student.birthDate}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">전화번호:</span>
                <span className="text-gray-800">{student.phone}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">이메일:</span>
                <span className="text-gray-800">{student.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">긴급연락처:</span>
                <span className="text-gray-800">{student.emergencyContactName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">관계:</span>
                <span className="text-gray-800">{student.emergencyContactRelation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 예약 관리 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">예약 관리</h3>
            </div>
            <p className="text-gray-600 mb-4">
              레슨 예약을 확인하고 관리하세요.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              예약 확인
            </button>
          </div>

          {/* 학습 자료 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">학습 자료</h3>
            </div>
            <p className="text-gray-600 mb-4">
              교재와 학습 자료를 확인하세요.
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              자료 확인
            </button>
          </div>

          {/* 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">설정</h3>
            </div>
            <p className="text-gray-600 mb-4">
              개인정보와 비밀번호를 관리하세요.
            </p>
            <button 
              onClick={() => router.push('/student/change-password')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">중요 안내</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• 학생 ID와 초기 비밀번호는 안전하게 보관해주세요.</li>
            <li>• 첫 로그인 시 비밀번호 변경을 권장합니다.</li>
            <li>• 레슨 예약은 최소 24시간 전에 해주세요.</li>
            <li>• 문의사항이 있으시면 관리자에게 연락해주세요.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}