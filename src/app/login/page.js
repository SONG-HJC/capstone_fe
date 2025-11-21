'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginSuccess } = useUser(); // Context에서 상태 업데이트 함수 가져오기

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoToSignUp = (e) => {
    e.preventDefault(); // 버튼 기본 동작 방지
    router.push("/signup"); // Next.js 라우터로 이동
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // form submit 새로고침 방지
    setErrorMsg(""); 

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: pw,
        }),
      });

      const data = await response.json();

      if (response.status === 200 && data.success === true) {
        // [성공]
        // 1. Context를 통해 전역 상태 업데이트 및 프로필 fetch 트리거
        await loginSuccess({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            nickname: data.data.nickname
        });

        alert("로그인 성공!");
        router.push("/"); // 메인 페이지로 이동
      } else {
        // [실패]
        setErrorMsg(data.error?.message || "로그인 실패");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm p-10 bg-white rounded-2xl shadow-xl text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-5">
          실시간 소음 모니터링 및 알림앱
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 my-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
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
            로그인
          </button>
          <a
          href="#"
          onClick={handleGoToSignUp}
          className="mt-3 inline-block cursor-pointer text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          아직 계정이 계정이 없으신가요? 회원가입        </a>
        </form>
        </div>
    </div>
  );
}