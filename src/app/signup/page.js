'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nickName, setNickname] = useState("");
  const [serialNum, setSerialNum] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  //회원가입 처리 로직
  const handleRegister = async (e) => {
    e.preventDefault(); // 폼 제출 시 기본 동작 방지

    setErrorMsg(""); // 에러 메시지 초기화

    if (!email || !pw || !nickName || !serialNum) {
      setErrorMsg("모든 항목을 입력해주세요."); // 입력값 검증
      return;
    }

    try {
      const response = await fetch(`/api/auth/signup`, { // API 호출
        method: "POST", // POST 메서드
        headers: {
          "Content-Type": "application/json", // JSON 타입 헤더
        },
        body: JSON.stringify({ // Body에 데이터 포함
          email: email,
          password: pw,
          nickName: nickName,
          serialNum: serialNum,
        }),
      });

      const data = await response.json(); // JSON 응답 파싱

      if (response.status === 201 && data.success === true) { 
        // 회원가입 성공 → 토큰 저장 (옵션)
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("nickName", data.data.user.nickName);
        
        alert("회원가입 성공! 로그인 페이지로 이동합니다."); // 알림
        router.push("/login"); // 로그인 페이지로 이동
      } else {
        setErrorMsg(data.error?.message || "회원가입 실패"); // 실패 메시지
      }
    } catch (err) {
      console.error(err); // 에러 로깅
      setErrorMsg("서버와 통신할 수 없습니다."); // 통신 실패 메시지
    }
  };

  //로그인 페이지로 이동
  const handleGoToLogin = (e) => {
    e.preventDefault(); // 버튼 기본 동작 방지
    router.push("/login"); // Next.js 라우터로 이동
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm p-10 bg-white rounded-2xl shadow-xl text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-5">
          소리 센서 모니터링 서비스
        </h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">회원가입</h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 my-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full p-2.5 my-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
          <input
            type="text"
            placeholder="닉네임"
            value={nickName}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-2.5 my-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="라즈베리파이 SerialNum"
            value={serialNum}
            onChange={(e) => setSerialNum(e.target.value)}
            className="w-full p-2.5 my-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 에러 메시지 표시 */}
          {errorMsg && (
            <div className="text-red-500 text-xs mb-2.5 text-left">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2.5 mt-2.5 border-none rounded-lg text-sm cursor-pointer hover:bg-blue-700 transition-colors"
          >
            회원가입
          </button>
        </form>

        <a
          href="#"
          onClick={handleGoToLogin}
          className="mt-3 inline-block cursor-pointer text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          이미 계정이 있으신가요? 로그인
        </a>
      </div>
    </div>
  );
}