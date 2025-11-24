'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '@/components/UserContext';
import { 
  BellAlertIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { apiRequest } from '@/utils/apiRequest';

import NoiseChart from '@/components/dashboard/NoiseChart';
import NoiseTable from '@/components/dashboard/NoiseTable';
import ToastContainer from '@/components/ui/ToastContainer';

const POLLING_INTERVAL = 5000;
const FETCH_LIMIT = 10;

// ====================== MAIN COMPONENT ==========================
export default function DashboardPage() {
  const { user, isLoading: isUserLoading, error: userError } = useUser();

  const [noiseData, setNoiseData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toasts, setToasts] = useState([]);
  const processedNoiseIds = useRef(new Set());

  // Admin states
  const [adminSerial, setAdminSerial] = useState('');
  const [adminNoise, setAdminNoise] = useState([]);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const [currentSerialLabel, setCurrentSerialLabel] = useState('');

  // -------------------- INITIAL LOAD FOR NORMAL USER ---------------------
  useEffect(() => {
    if (isUserLoading) return;
    if (userError) {
      setError(userError);
      setIsLoading(false);
      return;
    }
    if (!user) return;

    // 관리자라면 초기 자동 로딩 불필요 → 직접 조회
    if (isAdmin) {
      setIsLoading(false);
      return;
    }

    const loadInitial = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest(
          `/api/device/list?page=1&limit=${FETCH_LIMIT}`
        );
        const list = res?.data?.list || [];

        const processed = list.map(formatNoiseFromDevice).filter(Boolean);
        setNoiseData(processed);

        processedNoiseIds.current = new Set(
          processed.map(n => n.noise_id).filter(Boolean)
        );
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, [isUserLoading, user, userError]);

  // -------------------- POLLING FOR NORMAL USER ---------------------
  useEffect(() => {
    if (!user || isAdmin) return;

    let stop = false;

    const poll = async () => {
      try {
        const res = await apiRequest(
          `/api/device/list?page=1&limit=${FETCH_LIMIT}`
        );
        const list = res?.data?.list || [];

        const processed = list.map(formatNoiseFromDevice).filter(Boolean);
        setNoiseData(processed);
      } catch (err) {
        console.error("polling error", err);
      }
    };

    poll();
    const id = setInterval(() => { if (!stop) poll(); }, POLLING_INTERVAL);
    return () => { stop = true; clearInterval(id); };

  }, [user, isAdmin]);

  // -------------------- DETECT NEW NOISE (TOASTS) ---------------------
  useEffect(() => {
    if (!noiseData.length || isAdmin) return;

    const newToasts = [];

    noiseData.forEach(n => {
      if (n.is_noise && !processedNoiseIds.current.has(n.noise_id)) {
        newToasts.push({
          id: n.noise_id,
          title: `${n.what_noise} 소음 감지!`,
          message: `${n.rasberry_id}에서 ${n.dba}dB 발생`
        });
        processedNoiseIds.current.add(n.noise_id);
      }
    });

    if (newToasts.length > 0) {
      setToasts(prev => [...prev, ...newToasts]);
    }
  }, [noiseData, isAdmin]);

  // --------------------- ADMIN: FETCH BY SERIAL -------------------------
  const fetchAdminDevice = async () => {
    if (!adminSerial.trim()) {
      alert("serialNum을 입력하세요.");
      return;
    }

    setIsLoading(true);
    setAdminNoise([]);

    try {
      const res = await apiRequest(
        `/api/device/list?serialNum=${adminSerial}&page=1&limit=${FETCH_LIMIT}`
      );

      const list = res?.data?.list || [];

      const processed = list.map(formatNoiseFromDevice).filter(Boolean);
      setAdminNoise(processed);
      setCurrentSerialLabel(adminSerial);

    } catch (err) {
      alert("조회 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== DATA ANALYSIS LOGIC ====================
  // 현재 화면에 보여줄 데이터 결정
  const activeData = isAdmin ? adminNoise : noiseData;

  const analysisReport = useMemo(() => {
    if (!activeData || activeData.length === 0) return null;

    // 1. 최대 소음 찾기
    let maxItem = activeData[0];
    activeData.forEach(item => {
      if (item.dba > maxItem.dba) maxItem = item;
    });

    // 2. 가장 빈번한 소음 원인 찾기
    const counts = {};
    activeData.forEach(item => {
      const type = item.what_noise || '알 수 없음';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    // 최빈값 도출
    const frequentNoise = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    , '분석 중');

    // 3. 시간 포맷팅
    const maxTimeStr = maxItem.created_at 
      ? new Date(maxItem.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '-';

    // 4. 상태 판단 (예: 60dB 이상이면 주의)
    const hasNoise = activeData.some(item => item.is_noise);
    const isStable = !hasNoise;

    return {
      maxDba: maxItem.dba,
      maxTime: maxTimeStr,
      frequentNoise,
      isStable
    };
  }, [activeData]);


  // ------------------- LOADING / ERROR CHECK ------------------------
  if (isUserLoading) return LoadingUI("사용자 정보 로딩 중...");
  if (userError || error) return ErrorUI(userError || error);

  if (!user) return NoAccessUI();

// ====================== RENDER ==========================
  return (
    <div className="p-8 md:p-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-lg text-gray-600">{user.nickName}님 환영합니다.</p>
      </header>

      {/* ================= ADMIN ONLY ================= */}
      {isAdmin && (
        <section className="w-full max-w-6xl mb-10 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">기기 조회 (Admin)</h2>

          <div className="flex gap-4">
            <input
              className="border p-2 rounded w-64"
              placeholder="serialNum 입력"
              value={adminSerial}
              onChange={e => setAdminSerial(e.target.value)}
            />
            <button
              onClick={fetchAdminDevice}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              조회하기
            </button>
          </div>
        </section>
      )}

      {/* ================= ADMIN GRAPH ================= */}
      {isAdmin && adminNoise.length > 0 && (
        <section className="w-full max-w-6xl mb-12">
          <NoiseChart 
            data={mapNoiseForChart(adminNoise)} 
            title={`${currentSerialLabel} 소음 로그`} 
          />
        </section>
      )}

      {/* ================= USER GRAPH ================= */}
      {!isAdmin && (
        <section className="w-full max-w-6xl mb-12">
          <NoiseChart 
            data={mapNoiseForChart(noiseData)} 
            title="실시간 소음 그래프"
          />
        </section>
      )}

      {/* ================= DATA ANALYSIS REPORT ================= */}
      {/* 데이터가 있을 때만 표시 */}
      {analysisReport && (
        <section className="w-full max-w-6xl mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            실시간 데이터 분석
          </h2>
          
          <div className={`border rounded-lg shadow-md p-6 transition-colors duration-300 ${
            analysisReport.isStable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center">
              {analysisReport.isStable ? (
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mr-3" />
              )}
              
              <h3 className={`text-2xl font-bold ${
                analysisReport.isStable ? 'text-green-800' : 'text-orange-800'
              }`}>
                {analysisReport.isStable ? '안정적인 상태입니다' : '소음 주의가 필요합니다'}
              </h3>
            </div>

            <div className={`mt-4 space-y-3 ${
              analysisReport.isStable ? 'text-green-700' : 'text-orange-800'
            }`}>
              <p className="leading-relaxed">
                현재 수집된 데이터 중 <strong className="font-semibold">{analysisReport.maxTime}</strong> 경에
                최대 <strong className="font-semibold">{analysisReport.maxDba}dB</strong>의 소음이 감지되었습니다.
                {analysisReport.isStable 
                  ? ' 전반적으로 기준치 이하의 정숙한 환경이 유지되고 있습니다.' 
                  : ' 일시적으로 기준치를 초과하는 소음이 발생했으니 확인이 필요합니다.'}
              </p>
              <p className="leading-relaxed">
                AI 모델 분석 결과, 현재 주된 소음원은 
                <strong className="font-semibold"> '{analysisReport.frequentNoise}'</strong>(으)로 식별되었습니다.
              </p>
            </div>
          </div>
        </section>
      )}
      

      {/* ================= LOG TABLE ================= */}
      <section className="w-full max-w-6xl mb-12">
        <h2 className="text-2xl font-semibold mb-4">최근 소음 로그</h2>
        <NoiseTable 
          data={isAdmin ? adminNoise : noiseData}
        />
      </section>

      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

// ====================== HELPER FUNCTIONS ==========================

// 서버 응답 → noise 형태 변환
function formatNoiseFromDevice(item) {
  const noise = item.noise;
  const type = item.type;
  if (!noise) return null;

  return {
    noise_id: noise.noiseId,
    rasberry_id: type?.resberryId,
    what_noise: type?.noiseTypes,
    dba: noise.dba,
    is_noise: noise.isNoise,
    created_at: noise.createdAt
  };
}

function mapNoiseForChart(list) {
  return list
    .map(n => ({
      ...n,
      time: n.created_at
        ? new Date(n.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : ''
    }))
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
}

// ====================== UI COMPONENTS ==========================

// Loader
function LoadingUI(msg) {
  return (
    <div className="p-16 flex justify-center items-center">
      <p className="text-lg text-gray-500">{msg}</p>
    </div>
  );
}

// Error
function ErrorUI(err) {
  return (
    <div className="p-16 flex justify-center items-center">
      <p className="text-lg text-red-500">
        오류: {err.message}
      </p>
    </div>
  );
}

// No access UI
function NoAccessUI() {
  return (
    <div className="p-16 flex flex-col justify-center items-center text-center">
      <BellAlertIcon className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-3xl font-bold">접근 권한 없음</h2>
      <p className="text-lg text-gray-600">로그인이 필요합니다.</p>
    </div>
  );
}