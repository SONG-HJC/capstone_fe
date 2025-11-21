'use client';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
// 사용자 설명을 위한 아이콘
import { InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useUser } from '@/components/UserContext';

// 1. [수정] 1학기 프로젝트의 원본 데이터 (30dB대)
const exampleData = [
  { date: "2025-06-14", time: "22:39:53", dba: 32.11, vibration: 137 },
  { date: "2025-06-14", time: "22:40:53", dba: 37.90, vibration: 136 }, // <-- 최고 지점
  { date: "2025-06-14", time: "22:41:53", dba: 30.16, vibration: 121 },
  { date: "2025-06-14", time: "22:42:53", dba: 30.62, vibration: 133 },
  { date: "2025-06-14", time: "22:43:53", dba: 34.35, vibration: 134 },
  { date: "2025-06-14", time: "22:44:53", dba: 32.72, vibration: 136 },
  { date: "2025-06-14", time: "22:45:53", dba: 30.64, vibration: 134 },
  { date: "2025-06-14", time: "22:46:53", dba: 26.84, vibration: 138 },
  { date: "2025-06-14", time: "22:47:53", dba: 28.85, vibration: 145 },
  { date: "2025-06-14", time: "22:48:53", dba: 31.07, vibration: 133 }
];

// 그래프 X축에 표시할 "시간"만 추출 (예: "22:39")
const chartData = exampleData.map(d => ({
  ...d,
  time_label: d.time.substring(0, 5) // "22:39"
}));

// [수정] 원본 데이터에 맞는 분석 값
const maxDba = "37.90dB";
const maxTime = "22:40:53";
// (30dB대는 조용한 사무실/대화 수준이므로 'Speech'로 가정)
const frequentNoise = "'조용한 대화' (Speech)";


export default function MainPage() {

    const { user, isLoading } = useUser();

  return (
    <div className="p-8 md:p-16">
      
      {/* 페이지 타이틀 */}
      <section className="w-full max-w-6xl mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          소리 센서 데이터 실시간 표시 (예시)
        </h1>
        <p className="text-lg text-gray-600">
          로그인 전, 서비스가 어떻게 데이터를 시각화하는지 보여주는 예시 페이지입니다.
        </p>
      </section>

      {/* 예시 그래프 (dBA) */}
      <section className="w-full max-w-6xl mb-12">
        <ExampleChart data={chartData} />
      </section>

      {/* [수정] 데이터 분석 (안정적인 상태 설명) */}
      <section className="w-full max-w-6xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          데이터 분석 (예시)
        </h2>
        {/* '안정' 스타일 (초록색) */}
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-2xl font-bold text-green-800">
              데이터 분석 리포트 (예시)
            </h3>
          </div>
          <div className="mt-4 space-y-3 text-green-700">
            <p className="leading-relaxed">
              예시 데이터는 <strong className="font-semibold text-green-800">{maxTime}</strong> 경에
              최대 <strong className="font-semibold text-green-800">{maxDba}</strong>의 소음이 측정되었으나,
              전반적으로 기준치(예: 40dB) 이하의 <strong className="font-semibold text-green-800">매우 안정적인 상태</strong>를 보여줍니다.
            </p>
            <p className="leading-relaxed">
              YAMNet 모델 분석 결과, 이 기간 동안 가장 가능성이 높은 소음원은 
              <strong className="font-semibold text-green-800"> {frequentNoise}</strong>입니다.
              본 서비스는 단순 측정을 넘어, 소음의 종류를 식별하여 사용자에게 의미 있는 정보를 제공합니다.
            </p>
            <p className="leading-relaxed text-green-800 font-semibold">
              로그인하시면, 사용자의 기기에서 수집되는 실시간 데이터를 확인하고 '소음 알림 설정'을 통해 즉각적인 경고를 받으실 수 있습니다.
            </p>
          </div>
        </div>
      </section>
      {!isLoading && !user && (
        <section className="w-full max-w-6xl mt-16 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            회원가입
          </Link>
        </div>
      </section>
      )}

      {/* 2. 로딩 중이 아닐 때 + 로그인 상태일 때 (user가 존재) */}
      {!isLoading && user && (
        <section className="w-full max-w-6xl mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold text-blue-800">
                {user.nickName}님, 환영합니다!
              </p>
              <p className="text-gray-700 mt-1">
                대시보드에서 실시간 데이터를 확인해 보세요.
              </p>
            </div>
            {/* 버튼 영역 */}
            <Link
              href="/dashboard"
              className="mt-4 md:mt-0 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex-shrink-0"
            >
              대시보드로 이동
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}


// 헬퍼 컴포넌트: 예시 그래프
function ExampleChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">dBA 및 진동 그래프 (예시)</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* [수정] time_label 사용 */}
            <XAxis dataKey="time_label" /> 
            <YAxis yAxisId="left" label={{ value: 'dBA', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="dba" stroke="#8884d8" name="데시벨(dBA)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}