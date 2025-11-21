'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { apiRequest } from '@/utils/apiRequest'; 

// 로딩 UI
const RedirectingUI = ({ message = '페이지 이동 중...' }) => (
  <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div className="flex flex-col items-center p-8">
      <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

export default function AdminPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [isUserLoading, user, isAdmin, router]);


  // ============================
  // 상태값
  // ============================
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [emailSearchInput, setEmailSearchInput] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit,
    totalCount: 0,
    totalPages: 1
  });

  const isEmail = (str) => /\S+@\S+\.\S+/.test(str);


  // ============================
  // 전체 사용자 조회 API
  // ============================
  const fetchUsers = useCallback(async (page) => { 
    setListLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: page,
      limit: limit,
    });

    try {
      const url = `/api/admin/users?${params.toString()}`;
      const result = await apiRequest(url);

      if (result.data) {
        const fetchedUsers = result.data || [];
        setUsers(fetchedUsers);

        const fetchedPagination = result.pagination;
        
        if (fetchedPagination) {
          setPagination(fetchedPagination);
          setCurrentPage(fetchedPagination.page);
        } else {
          setPagination({
            page: page,
            limit: limit,
            totalCount: fetchedUsers.length,
            totalPages: Math.ceil(fetchedUsers.length / limit) || 1
          });
          setCurrentPage(page);
        }
      } else {
        setUsers([]);
        setPagination({ page: 1, limit, totalCount: 0, totalPages: 1 });
      }

    } catch (err) {
      setUsers([]);
      setPagination({ page: 1, limit, totalCount: 0, totalPages: 1 });
      setError(err);
    } finally {
      setListLoading(false);
    }
  }, [limit]);


  useEffect(() => {
    if (isAdmin) {
      fetchUsers(currentPage);
    }
  }, [isAdmin, currentPage, fetchUsers]);


  // ============================
  // 이메일 검색 API
  // ============================
  const handleEmailSearch = async (e) => {
    e.preventDefault();
    const email = emailSearchInput.trim();

    if (!isEmail(email)) {
      setError(new Error("올바른 이메일 형식이 아닙니다."));
      return;
    }

    setListLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/api/admin/users/${email}`;
      const result = await apiRequest(url);

      if (result.data) {
        setUsers([result.data]);
        setPagination({ page: 1, limit: 10, totalCount: 1, totalPages: 1 });
        setCurrentPage(1);
      } else {
        setUsers([]);
        setPagination({ page: 1, limit: 10, totalCount: 0, totalPages: 1 });
      }
    } catch (err) {
      setUsers([]);
      setError(err);
    } finally {
      setListLoading(false);
    }
  };


  // ============================
  // 권한 변경 API
  // ============================
  const handleRoleChange = async (userEmail, currentRole) => {
    // 본인 권한은 변경 불가
    if (userEmail === user.email) {
      alert("자신의 권한은 변경할 수 없습니다.");
      return;
    }

    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    const confirmed = window.confirm(
      `${userEmail} 사용자의 권한을 ${newRole}으로 변경하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const url = `${API_BASE_URL}/api/admin/users/${userEmail}/role`;
      
      await apiRequest(url, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      // 성공 시: users 상태 업데이트
      setUsers(prevUsers => prevUsers.map(u => 
        u.email === userEmail 
          ? { ...u, role: newRole } 
          : u
      ));
      
      alert(`성공적으로 ${userEmail} 사용자의 권한이 ${newRole}로 변경되었습니다.`);

    } catch (err) {
      alert("권한 변경 실패: " + err.message);
    }
  };


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };


  // 접근 권한 처리
  if (isUserLoading || !user || !isAdmin) {
    const message = isUserLoading
      ? "사용자 정보 확인 중..."
      : !user
        ? "로그인 확인 중..."
        : "권한 확인 중... (메인으로 이동)";
    return <RedirectingUI message={message} />;
  }


  // ============================
  // 렌더링
  // ============================
  return (
    <div className="p-8 md:p-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        관리자 페이지 (Admin Dashboard)
      </h1>

      {/* 사용자 검색 UI */}
      <div className="w-full max-w-6xl mb-10">
        <section className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-blue-500">
          <div className="flex items-center mb-6">
            <UserGroupIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">사용자 검색 및 관리</h2>
          </div>

          {/* 이메일 검색 + 전체 조회 버튼 */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">

            {/* 이메일 검색 */}
            <form 
              onSubmit={handleEmailSearch}
              className="flex w-full lg:w-1/2 gap-2"
            >
              <input
                type="text"
                placeholder="이메일 입력 (정확 검색)"
                value={emailSearchInput}
                onChange={(e) => setEmailSearchInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                이메일 검색
              </button>
            </form>

            {/* 전체 사용자 조회 버튼 */}
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchUsers(1); 
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              전체 사용자 조회
            </button>
          </div>

          {/* 오류 메시지 */}
          {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                <strong>오류 내용:</strong> {error.message}
              </div>
          )}

          {/* 데이터 없음 */}
          {!listLoading && users.length === 0 && !error && (
            <div className="text-gray-500 bg-gray-50 p-5 rounded-lg text-center border border-gray-200">
              검색된 사용자 정보가 없습니다.
            </div>
          )}

          {/* 로딩 */}
          {listLoading && <RedirectingUI message="사용자 목록 불러오는 중..." />}

          {/* 테이블 */}
          {!listLoading && users.length > 0 && (
            <>
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">닉네임</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
                      {/* [신규] 액션 열 추가 */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.email}>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.nickName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        {/* [신규] 권한 변경 버튼 */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRoleChange(u.email, u.role)}
                            disabled={u.email === user.email}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              u.role === 'ADMIN'
                                ? 'bg-orange-500 text-white hover:bg-orange-600' // ADMIN -> USER로 변경 버튼 (강등)
                                : 'bg-green-500 text-white hover:bg-green-600' // USER -> ADMIN으로 변경 버튼 (승격)
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'USER로 강등' : 'ADMIN으로 승격'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || listLoading}
                  className="px-3 py-1 border rounded-lg"
                >
                  이전
                </button>

                <span>
                  {currentPage} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || listLoading}
                  className="px-3 py-1 border rounded-lg"
                >
                  다음
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}