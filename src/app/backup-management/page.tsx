"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  FileText,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface BackupInfo {
  version: string;
  timestamp: string;
  path: string;
  type: "history" | "rolling" | "protected";
  size: number;
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  historyCount: number;
  rollingCount: number;
  protectedCount: number;
  protectedList: string[];
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<{
    history: BackupInfo[];
    rolling: BackupInfo[];
    protected: BackupInfo[];
  }>({ history: [], rolling: [], protected: [] });
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showProtectedList, setShowProtectedList] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [newProtectedVersion, setNewProtectedVersion] = useState("");
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [restoreType, setRestoreType] = useState<
    "history" | "rolling" | "protected"
  >("rolling");
  const [showSettings, setShowSettings] = useState(false);
  const [backupConfig, setBackupConfig] =
    useState<Record<string, unknown>>(null);
  const [localDownloadPath, setLocalDownloadPath] = useState("");

  // 백업 목록 조회
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/backups");
      const data = await response.json();

      if (data.success) {
        setBackups(data.data);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("백업 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 백업 생성
  const handleCreateBackup = async () => {
    if (!newVersion) {
      alert("버전을 입력해주세요");
      return;
    }

    // 버전 형식 검증
    const versionRegex = /^v\d+\.\d+\.\d+$/;
    if (!versionRegex.test(newVersion)) {
      alert("올바른 버전 형식이 아닙니다 (예: v1.0.0)");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version: newVersion }),
      });

      const data = await response.json();

      if (data.success) {
        alert("백업이 생성되었습니다");
        setShowCreateBackup(false);
        setNewVersion("");
        fetchBackups();
      } else {
        alert(data.error || "백업 생성 실패");
      }
    } catch (error) {
      alert("백업 생성 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 백업 복원
  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      alert("복원할 백업을 선택해주세요");
      return;
    }

    if (
      !confirm(
        `정말로 ${selectedBackup.version} (${selectedBackup.type}) 백업을 복원하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/backups/${selectedBackup.version}/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: restoreType }),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("백업 복원이 완료되었습니다");
        setSelectedBackup(null);
      } else {
        alert(data.error || "백업 복원 실패");
      }
    } catch (error) {
      alert("백업 복원 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 보호 목록에 추가
  const handleAddToProtected = async () => {
    if (!newProtectedVersion) {
      alert("버전을 입력해주세요");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/backups/protected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version: newProtectedVersion }),
      });

      const data = await response.json();

      if (data.success) {
        alert("보호 목록에 추가되었습니다");
        setShowProtectedList(false);
        setNewProtectedVersion("");
        fetchBackups();
      } else {
        alert(data.error || "보호 목록 추가 실패");
      }
    } catch (error) {
      alert("보호 목록 추가 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 보호 목록에서 제거
  const handleRemoveFromProtected = async (version: string) => {
    if (!confirm(`정말로 ${version}을 보호 목록에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/backups/protected?version=${version}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("보호 목록에서 제거되었습니다");
        fetchBackups();
      } else {
        alert(data.error || "보호 목록 제거 실패");
      }
    } catch (error) {
      alert("보호 목록 제거 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 백업 다운로드
  const handleDownloadBackup = async (backup: BackupInfo) => {
    try {
      setLoading(true);

      // 백업 정보 확인
      const infoResponse = await fetch(
        `/api/backups/download?version=${backup.version}&type=${backup.type}`,
      );
      const infoData = await infoResponse.json();

      if (!infoData.success) {
        alert("백업 정보를 찾을 수 없습니다");
        return;
      }

      // 다운로드 실행
      const response = await fetch("/api/backups/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: backup.version,
          type: backup.type,
        }),
      });

      if (!response.ok) {
        throw new Error("다운로드 실패");
      }

      // 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `malmoi-backup-${backup.version}-${backup.type}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("백업이 성공적으로 다운로드되었습니다");
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 백업 설정 조회
  const fetchBackupConfig = async () => {
    try {
      const response = await fetch("/api/backups/config");
      const data = await response.json();

      if (data.success) {
        setBackupConfig(data.data);
      }
    } catch (error) {
      console.error("설정 조회 실패:", error);
    }
  };

  // 백업 설정 업데이트
  const handleUpdateConfig = async (newConfig: Record<string, unknown>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/backups/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConfig),
      });

      const data = await response.json();

      if (data.success) {
        alert("설정이 업데이트되었습니다");
        setShowSettings(false);
        fetchBackupConfig();
      } else {
        alert(data.error || "설정 업데이트 실패");
      }
    } catch (error) {
      alert("설정 업데이트 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    fetchBackups();
    fetchBackupConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">백업 관리</h1>
            <p className="text-lg text-gray-600">버전 기반 백업 시스템 관리</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            메인 페이지로
          </Link>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">총 백업</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalBackups}
                  </div>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">총 크기</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatFileSize(stats.totalSize)}
                  </div>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">History</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.historyCount}
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Protected</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.protectedCount}/5
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateBackup(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              백업 생성
            </button>

            <button
              onClick={() => setShowProtectedList(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              보호 목록 관리
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              설정
            </button>

            <button
              onClick={fetchBackups}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              새로고침
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History 백업 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              History 백업 ({backups.history.length})
            </h2>
            <p className="text-sm text-gray-600 mb-4">무제한 보존</p>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : backups.history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>History 백업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.history
                  .slice(-5)
                  .reverse()
                  .map((backup) => (
                    <div
                      key={backup.version}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {backup.version}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(backup.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatFileSize(backup.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBackup(backup)}
                          className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          복원
                        </button>
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          disabled={loading}
                          className="flex-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3 h-3 inline mr-1" />
                          다운로드
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Rolling 백업 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Rolling 백업 ({backups.rolling.length})
            </h2>
            <p className="text-sm text-gray-600 mb-4">최신 10개만 보관</p>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : backups.rolling.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Rolling 백업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.rolling
                  .slice(-5)
                  .reverse()
                  .map((backup) => (
                    <div
                      key={backup.version}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {backup.version}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(backup.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatFileSize(backup.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBackup(backup)}
                          className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          복원
                        </button>
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          disabled={loading}
                          className="flex-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3 h-3 inline mr-1" />
                          다운로드
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Protected 백업 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Protected 백업 ({backups.protected.length})
            </h2>
            <p className="text-sm text-gray-600 mb-4">영구 보관 (최대 5개)</p>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : backups.protected.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Protected 백업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.protected.map((backup) => (
                  <div
                    key={backup.version}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {backup.version}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(backup.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatFileSize(backup.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedBackup(backup)}
                        className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        복원
                      </button>
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        disabled={loading}
                        className="flex-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3 h-3 inline mr-1" />
                        다운로드
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 백업 복원 모달 */}
        {selectedBackup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                백업 복원
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    복원할 백업
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedBackup.version}</div>
                    <div className="text-sm text-gray-600">
                      {selectedBackup.type}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    복원 타입
                  </label>
                  <select
                    value={restoreType}
                    onChange={(e) =>
                      setRestoreType(
                        e.target.value as "history" | "rolling" | "protected",
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rolling">Rolling</option>
                    <option value="history">History</option>
                    <option value="protected">Protected</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBackup(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleRestoreBackup}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "복원 중..." : "복원"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 백업 생성 모달 */}
        {showCreateBackup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                백업 생성
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버전 (예: v1.0.0)
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="v1.0.0"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateBackup(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "생성 중..." : "생성"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 보호 목록 관리 모달 */}
        {showProtectedList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                보호 목록 관리
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보호 목록에 추가
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProtectedVersion}
                      onChange={(e) => setNewProtectedVersion(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="v1.0.0"
                    />
                    <button
                      onClick={handleAddToProtected}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {stats?.protectedList && stats.protectedList.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      현재 보호 목록
                    </label>
                    <div className="space-y-2">
                      {stats.protectedList.map((version) => (
                        <div
                          key={version}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{version}</span>
                          <button
                            onClick={() => handleRemoveFromProtected(version)}
                            disabled={loading}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProtectedList(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 백업 설정 모달 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                백업 설정
              </h3>
              <div className="space-y-4">
                {backupConfig && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        백업 기본 경로
                      </label>
                      <input
                        type="text"
                        defaultValue={backupConfig.basePath}
                        onChange={(e) =>
                          setBackupConfig({
                            ...backupConfig,
                            basePath: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="./backups"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        백업 파일들이 저장될 기본 디렉토리 경로
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rolling 백업 최대 개수
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={backupConfig.maxRollingBackups}
                        onChange={(e) =>
                          setBackupConfig({
                            ...backupConfig,
                            maxRollingBackups: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Rolling 백업은 최신 N개만 유지됩니다 (1-100)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Protected 백업 최대 개수
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        defaultValue={backupConfig.maxProtectedBackups}
                        onChange={(e) =>
                          setBackupConfig({
                            ...backupConfig,
                            maxProtectedBackups: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Protected 백업은 영구 보관됩니다 (1-50)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        로컬 다운로드 경로
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localDownloadPath}
                          onChange={(e) => setLocalDownloadPath(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="다운로드 폴더 경로 (선택사항)"
                        />
                        <button
                          onClick={() => {
                            // 폴더 선택 다이얼로그 (브라우저 제한으로 인해 수동 입력)
                            alert(
                              "브라우저 보안상 폴더 선택이 제한됩니다. 경로를 수동으로 입력해주세요.",
                            );
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        백업 다운로드 시 기본 저장 경로 (예:
                        ~/Downloads/backups)
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleUpdateConfig(backupConfig)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
