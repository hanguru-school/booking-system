"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp, Edit, Plus, BookOpen, Star } from "lucide-react";

interface LevelInfo {
  id: string;
  studentId: string;
  studentName: string;
  currentLevel: string;
  course: string;
  progress: number;
  evaluation?: string;
  lastUpdated: string;
}

function StudentLevelsContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, [studentId]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      // 실제 API 엔드포인트로 교체 필요
      const response = await fetch('/api/admin/students/levels', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.levels) {
          setLevels(data.levels);
        }
      }
    } catch (error) {
      console.error('레벨 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">레벨 정보</h1>
              <p className="text-lg text-gray-600 mt-2">
                학생의 현재 수준, 코스, 평가 등 수업 진행에 필요한 정보를 관리합니다.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              레벨 추가
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {levels.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">레벨 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => (
                <div key={level.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{level.studentName}</h3>
                      <p className="text-sm text-gray-500 mt-1">마지막 업데이트: {new Date(level.lastUpdated).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">현재 레벨</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{level.currentLevel}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">코스</span>
                      </div>
                      <p className="text-base text-gray-900">{level.course}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">진행률</span>
                        <span className="text-sm text-gray-600">{level.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${level.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {level.evaluation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">{level.evaluation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentLevelsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <StudentLevelsContent />
    </Suspense>
  );
}

