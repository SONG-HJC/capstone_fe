/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  async rewrites() {
    return [
      {
        // 프론트엔드에서 '/api/...'로 요청을 보내면
        source: '/api/:path*',
        // 실제로는 이 백엔드 주소로 보낸 것처럼 처리해라
        destination: 'https://sorikyul.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
