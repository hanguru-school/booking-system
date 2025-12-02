'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Tag,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface TaggingLog {
  uid: string;
  userName: string;
  eventType: 'attendance' | 'checkout' | 'visit';
  timestamp: string;
}

export default function TaggingLogsPage() {
  const [logs, setLogs] = useState<TaggingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');

  // 태깅 이력 조회
  const fetchLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterDate) params.append('filterDate', filterDate);
      if (filterType) params.append('filterType', filterType);
      
      const response = await fetch(`/api/tagging/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(Math.ceil(data.total / 10));
      }
    } catch (error) {
      console.error('이력 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터 적용
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterType('');
    setCurrentPage(1);
    fetchLogs(1);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLogs(page);
  };

  // 이벤트 타입 한글 변환
  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'attendance': return '출석';
      case 'checkout': return '퇴근';
      case 'visit': return '방문';
      default: return eventType;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              태깅 이력 관리
            </h1>
            <p className="text-lg text-gray-600">
              모든 태깅 이벤트 로그 조회 및 필터링
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            메인으로
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="UID 또는 사용자명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 날짜 필터 */}
            <div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 이벤트 타입 필터 */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">모든 이벤트</option>
                <option value="attendance">출석</option>
                <option value="checkout">퇴근</option>
                <option value="visit">방문</option>
              </select>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                검색
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 로그 테이블 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              태깅 로그
            </h2>
            <button
              onClick={() => fetchLogs(currentPage)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>태깅 로그가 없습니다</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">UID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">사용자명</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">이벤트</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{log.uid}</td>
                        <td className="py-3 px-4">{log.userName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.eventType === 'attendance' ? 'bg-green-100 text-green-800' :
                            log.eventType === 'checkout' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {getEventTypeText(log.eventType)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    페이지 {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      이전
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      다음
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 