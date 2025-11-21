'use client'; 

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
// [수정] useUser 훅 임포트 제거 (더 이상 여기서 필요 X)
// import { useUser } from '@/components/UserContext';


export default function ClientLayoutWrapper({ children }) {
  // 사이드바 '열림/닫힘' 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // [제거] '공유 저장소'에서 user, isLoading 상태를 가져올 필요 없음
  // const { user, isLoading } = useUser();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* [수정] user, isLoading props 제거 */}
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* [수정] user prop 제거 */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* 3. 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}