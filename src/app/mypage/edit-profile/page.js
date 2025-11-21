'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { apiRequest } from '@/utils/apiRequest';
import { API_BASE_URL } from '@/utils/config';
import FormInput from '@/components/ui/FormInput';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser, isLoading: isUserLoading } = useUser();

  const [formData, setFormData] = useState({
    nickName: '',
    password: '' // 비밀번호는 선택 입력
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // user 정보 로드 → 폼에 채우기
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nickName: user.nickName || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) return;
  if (isSubmitting) return;

  const nicknameChanged = formData.nickName !== user.nickName;
  const passwordChanged = formData.password.trim() !== "";

  // 닉네임 변경이 있는데 1자 미만이면 에러
  if (nicknameChanged && formData.nickName.trim().length < 1) {
    setError("닉네임은 최소 1자 이상이어야 합니다.");
    return;
  }

  // 둘 다 변경 없을 때
  if (!nicknameChanged && !passwordChanged) {
    alert("변경된 내용이 없습니다.");
    return;
  }

  setIsSubmitting(true);
  setError(null);

  const body = {};

  if (nicknameChanged) {
    body.nickName = formData.nickName.trim();
  }

  if (passwordChanged) {
    body.password = formData.password.trim();
  }

  try {
  const result = await apiRequest(`${API_BASE_URL}/api/user/my`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

  // 서버가 user를 응답에 안 넣었을 때 처리
  if (!result?.data?.user) {
    // 직접 프로필 다시 가져오기
    try {
      const refreshed = await apiRequest(`${API_BASE_URL}/api/user/my`);
      if (refreshed?.data?.user) {
        setUser(refreshed.data.user);
      }
    } catch (e) {
      console.error("프로필 재조회 실패:", e);
    }

    alert("프로필이 성공적으로 수정되었습니다.");
    router.push("/mypage");
    return;
  }

  // 정상적으로 user가 온 경우
  setUser(result.data.user);
  alert("프로필이 성공적으로 수정되었습니다.");
  router.push('/mypage');

  } catch (err) {
    setError(err.message || "수정 중 오류가 발생했습니다.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (isUserLoading) {
    return (
      <div className="p-8 md:p-16 flex justify-center items-center h-full">
        <p className="text-lg text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="p-8 md:p-16">

      <section className="w-full max-w-4xl mb-8">
        <Link 
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          마이페이지로 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-800">
          정보 수정
        </h1>
        <p className="text-lg text-gray-600">
          계정 정보를 수정합니다.
        </p>
      </section>

      <section className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">

          {/* 기본 정보 수정 */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              기본 정보
            </legend>

            <div className="space-y-4">
              <FormInput
                label="닉네임"
                id="nickName"
                name="nickName"
                type="text"
                value={formData.nickName}
                onChange={handleChange}
                required
              />

              <FormInput
                label="이메일 (수정 불가)"
                id="email"
                type="text"
                value={user.email}
                disabled
              />

              <FormInput
                label="권한"
                id="role"
                type="text"
                value={user.role}
                disabled
              />
            </div>
          </fieldset>

          {/* 비밀번호 변경 */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 pt-4">
              비밀번호 변경 (선택 사항)
            </legend>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                비밀번호를 변경하지 않으려면 비워두세요.
              </p>

              <FormInput
                label="새 비밀번호"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600 py-2 px-3 bg-red-50 rounded-md">
              <span className="font-bold">오류:</span> {error}
            </p>
          )}

          <div className="flex justify-end items-center gap-4 pt-4 border-t">
            <Link
              href="/mypage"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {isSubmitting ? '저장 중...' : '변경 내용 저장'}
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}