'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function MasterAdminSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  useEffect(() => {
    // 마스터 관리자 권한 확인
    const checkMasterAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'ADMIN') {
            // 관리자 정보 확인
            const adminResponse = await fetch('/api/admin/profile');
            if (adminResponse.ok) {
              const adminData = await adminResponse.json();
              if (adminData.permissions?.isMaster) {
                setIsMasterAdmin(true);
              } else {
                alert('マスター管理者権限が必要です。');
                router.push('/auth/login');
              }
            } else {
              // Admin 정보가 없는 경우에도 마스터 관리자로 간주 (초기 설정)
              setIsMasterAdmin(true);
            }
          } else {
            alert('管理者権限が必要です。');
            router.push('/auth/login');
          }
        } else {
          alert('ログインが必要です。');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('権限確認エラー:', error);
        router.push('/auth/login');
      }
    };

    checkMasterAdmin();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 비밀번호 강도 체크
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('現在のパスワードを入力してください。');
      return false;
    }
    if (!formData.newPassword) {
      setError('新しいパスワードを入力してください。');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('新しいパスワードは8文字以上で入力してください。');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('新しいパスワードが一致しません。');
      return false;
    }
    if (passwordStrength < 3) {
      setError('より安全なパスワードを設定してください。');
      return false;
    }
    if (formData.newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmail)) {
      setError('有効なメールアドレスを入力してください。');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/master-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          newEmail: formData.newEmail || undefined,
        }),
      });

      if (response.ok) {
        alert('マスター管理者の設定が完了しました！\n\n管理者ダッシュボードに移動します。');
        router.push('/admin');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '設定に失敗しました。');
      }
    } catch (err) {
      console.error('設定エラー:', err);
      setError('サーバーとの通信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'text-red-500';
    if (passwordStrength <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return '弱い';
    if (passwordStrength <= 3) return '普通';
    return '強い';
  };

  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">権限を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-red-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  マスター管理者設定
                </h1>
              </div>
              <p className="text-gray-600">
                初回設定のため、パスワードとメールアドレスを変更してください。
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在のパスワード <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="現在のパスワードを入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 새 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいメールアドレス
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="新しいメールアドレスを入力（オプション）"
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="新しいパスワードを入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* 비밀번호 강도 표시 */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">パスワード強度:</span>
                      <span className={getPasswordStrengthColor()}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength <= 2 ? 'bg-red-500' :
                          passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード（確認） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="新しいパスワードを再入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* 비밀번호 일치 확인 */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm">
                    {formData.newPassword === formData.confirmPassword ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        パスワードが一致しています
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        パスワードが一致しません
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 비밀번호 요구사항 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  パスワード要件:
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 8文字以上</li>
                  <li>• 大文字と小文字を含む</li>
                  <li>• 数字を含む</li>
                  <li>• 特殊文字を含む（推奨）</li>
                </ul>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    処理中...
                  </div>
                ) : (
                  'マスター管理者設定完了'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
