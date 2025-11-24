'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/utils/apiRequest';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 내 정보 불러오기 함수
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // 토큰이 없으면 로딩 끝내고 리턴
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await apiRequest(`/api/user/my`);
      const userData = response.data.user
      
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      // 토큰 만료 등으로 실패 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("nickname");
      setUser(null);
      // 필요시 에러 세팅: setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 앱 실행 시 최초 1회 실행
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // LoginPage에서 로그인 API 성공 후 호출하여 상태를 업데이트함
  const loginSuccess = async (tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("nickname", tokens.nickname); // 닉네임도 저장
    await fetchUserProfile(); // 프로필 정보를 새로 받아옴
  };

  // 로그아웃 처리
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nickname");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, error, loginSuccess, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}