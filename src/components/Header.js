'use client'; 

import Link from 'next/link';
import { UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation';

export default function Header({ toggleSidebar}) { 
  const { user, isLoading, logout } = useUser();
  const router = useRouter();
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/'); 
  };

  return (
    <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6 z-10 flex-shrink-0">
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-700 hover:text-blue-600"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <Link href="/" className="text-xl font-bold text-gray-900">
          소리결
        </Link>
      </div>
      
      {/* 우측 프로필 아이콘 */}
      <div>
        {(isLoading || !user) && (
          <Link 
            href="/login"
            onClick={() => sessionStorage.removeItem('isLoggedOut')}  
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <UserCircleIcon className="w-8 h-8 text-gray-400 hover:text-gray-600" />
            <span className="text-sm font-medium hidden sm:block">
              {isLoading ? "로딩..." : "로그인"}
            </span>
          </Link>
        )}

        {/* 2. 로그인 상태일 때 */}
        {!isLoading && user && (
          <div className="flex items-center gap-4"> 
            {/* 마이페이지 링크 */}
            <Link 
              href="/mypage" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <UserCircleIcon className="w-8 h-8 text-gray-400 hover:text-gray-600" />
              <span className="text-sm font-medium hidden sm:block">
                {/* [수정] API에서 받아온 닉네임(nickName) 사용 */}
                {user.nickName}
              </span>
            </Link>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800 hidden sm:block"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}