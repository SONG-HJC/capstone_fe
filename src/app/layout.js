import '../globals.css';
// [수정] ClientLayoutWrapper -> UserProvider로 변경
import { UserProvider } from '@/components/UserContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: '캡스톤 프로젝트',
  description: 'Next.js와 Tailwind CSS로 UI 구현',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="h-screen w-screen overflow-hidden bg-gray-100">
        
        {/* [수정] UserProvider가 모든 하위 컴포넌트를 감싸도록 함 */}
        <UserProvider>
          {/* ClientLayoutWrapper는 이제 props 주입 없이 레이아웃만 담당 */}
          <ClientLayoutWrapper>
            {children} 
          </ClientLayoutWrapper>
        </UserProvider>

      </body>
    </html>
  );
}