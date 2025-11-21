'use client';

import Link from 'next/link';
import { BellAlertIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/apiRequest';
import { API_BASE_URL } from '@/utils/config';

import InfoItem from '@/components/mypage/InfoItem';
import ToggleItem from '@/components/mypage/ToggleItem';

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, error: userError, setUser, logout } = useUser();
  const noticeSetting = user?.noticeSet ?? false;

/**
 * 🔄 알림 설정 토글: PATCH /api/user/notice
 */
  const handleNoticeToggle = async () => {
  const newSetting = !noticeSetting;

  // Optimistic UI 업데이트
  setUser(prev => ({ ...prev, noticeSet: newSetting }));

  try {
    const result = await apiRequest(`${API_BASE_URL}/api/user/notice`, {
      method: "PATCH",
      body: JSON.stringify({ noticeSet: newSetting }),
    });

    // 서버에서 전체 user 객체를 내려주면 → 그걸로 갱신
    if (result.data && typeof result.data === "object") {
      if ("email" in result.data) {
        // 전체 사용자 정보가 내려온 경우
        setUser(result.data);
      } else if ("noticeSet" in result.data) {
        // noticeSet만 내려온 경우 → 기존 user에 병합
        setUser(prev => ({
          ...prev,
          noticeSet: result.data.noticeSet
        }));
      }
    }

  } catch (err) {
    alert(`설정 변경 실패: ${err.message}`);

    // 실패 시 원복
    setUser(prev => ({ ...prev, noticeSet: !newSetting }));
  }
};

  /**
   * 🗑️ 회원 탈퇴: DELETE /api/user/my
   */
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "정말로 계정을 삭제하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
    );
    if (!confirmed) return;

    try {
      await apiRequest(`${API_BASE_URL}/api/user/my`, {
        method: "DELETE"
      });

      alert("계정이 성공적으로 삭제되었습니다.");
      logout();
      router.push("/");

    } catch (err) {
      alert(err.message);
    }
  };

  // ===========================================
  // 로딩 & 오류 & 비로그인 처리
  // ===========================================
  if (isUserLoading) {
    return (
      <div className="p-8 md:p-16 flex justify-center items-center h-full">
        <p className="text-lg text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 md:p-16 flex flex-col justify-center items-center h-full text-center">
        <BellAlertIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">접근 권한이 없습니다.</h2>
        <p className="text-lg text-gray-600">
          마이페이지는 로그인이 필요한 페이지입니다.
        </p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-8 md:p-16 flex justify-center items-center h-full">
        <p className="text-lg text-red-500">오류: {userError.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-16">

      {/* 타이틀 */}
      <section className="w-full max-w-6xl mb-8">
        <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>
        <p className="text-lg text-gray-600">{user.nickName}님의 계정 정보를 관리합니다.</p>
      </section>

      {/* 유저 정보 & 설정 */}
      <section className="w-full max-w-6xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* 유저 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3 text-gray-700">계정 정보</h2>

            <div className="space-y-4">
              <InfoItem label="이름" value={user.nickName} />
              <InfoItem label="이메일" value={user.email} />
              <InfoItem label="권한" value={Array.isArray(user.roles) ? user.roles.join(', ') : user.role || '일반'} />
            </div>

            <div className="flex justify-end mt-6">
              <Link
                href="/mypage/edit-profile"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" />
                정보 수정
              </Link>
            </div>
          </div>

          {/* 기본 설정 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3 text-gray-700">기본 설정</h2>

            <ToggleItem
              label="소음 알림 설정"
              description="기준치 이상 발생 시 알림"
              isEnabled={noticeSetting}
              onToggle={handleNoticeToggle}
            />
          </div>

        </div>
      </section>

      {/* 계정 삭제 */}
      <section className="w-full max-w-6xl mb-8 space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border border-red-200">
          <div>
            <h3 className="font-semibold text-red-700">계정 삭제</h3>
            <p className="text-sm text-gray-500">
              계정 삭제 시 모든 데이터가 영구적으로 제거되며 복구할 수 없습니다.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            계정 삭제
          </button>
        </div>
      </section>

    </div>
  );
}
