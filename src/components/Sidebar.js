'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon, 
  ChartBarIcon, 
  UserCircleIcon, 
  ArrowLeftOnRectangleIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon // [신규] 관리자 아이콘 추가
} from '@heroicons/react/24/outline'; 
import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation'; 

export default function Sidebar({ isOpen }) { 
  const pathname = usePathname(); 
  const { user, logout } = useUser();
  const router = useRouter(); 

  // [신규] 관리자 여부 확인 (Dashboard 페이지의 로직과 동일하게 유지)
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const NavLink = ({ href, icon: Icon, children, isOpen, onClick }) => { 
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={onClick} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${
          !isOpen ? 'justify-center' : ''
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {children}
        </span>
      </Link>
    );
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/');
  };

  return (
    <aside 
      className={`bg-white h-full flex flex-col shadow-lg flex-shrink-0
                  transition-all duration-300 ease-in-out
                  ${isOpen ? 'w-64 p-4' : 'w-20 p-4'}`}
    >
      
      {/* 1. 프로젝트 이름 (로고) */}
      <div className={`px-3 py-4 mb-4 ${!isOpen ? 'flex justify-center' : ''}`}>
        <Link href="/" className="text-xl font-bold text-gray-900">
          {isOpen ? '소리결' : 'S'}
        </Link>
      </div>
      
      {/* 2. 메인 네비게이션 */}
      <nav className="flex-1 space-y-2">
        <NavLink href="/" icon={HomeIcon} isOpen={isOpen}>
          메인페이지
        </NavLink>

        {/* user가 존재할 때(로그인 시)에만 렌더링 */}
        {user && (
          <>
            <NavLink href="/dashboard" icon={ChartBarIcon} isOpen={isOpen}>
              대시보드
            </NavLink>
            <NavLink href="/mypage" icon={UserCircleIcon} isOpen={isOpen}>
              마이페이지
            </NavLink>

            {/* [신규] 관리자 계정일 경우에만 표시되는 메뉴 */}
            {isAdmin && (
              <NavLink href="/admin" icon={ShieldCheckIcon} isOpen={isOpen}>
                관리자 페이지
              </NavLink>
            )}
          </>
        )}
      </nav>
      
      {/* 3. 하단 메뉴 */}
      <div className="mt-auto space-y-2">
        {user ? (
          <a
            href="#"
            onClick={handleLogout} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50
                        ${!isOpen ? 'justify-center' : ''}`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              로그아웃
            </span>
          </a>
        ) : (
          <NavLink 
            href="/login" 
            icon={ArrowRightOnRectangleIcon} 
            isOpen={isOpen}
            onClick={() => sessionStorage.removeItem('isLoggedOut')} 
          >
            로그인
          </NavLink>
        )}
      </div>
    </aside>
  );
}