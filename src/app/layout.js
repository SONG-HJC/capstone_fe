import '../globals.css';
import { UserProvider } from '@/components/UserContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: '소리결',
  description: '소리결(소음 판별 및 분석 시스템)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="h-screen w-screen overflow-hidden bg-gray-100">
        
        <UserProvider>
          <ClientLayoutWrapper>
            {children} 
          </ClientLayoutWrapper>
        </UserProvider>

      </body>
    </html>
  );
}