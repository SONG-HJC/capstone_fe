
// ================= TABLE (dB만 표시) ======================

export default function NoiseTable({ data }) {
  const sorted = data
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ul className="divide-y divide-gray-200">
        {sorted.length === 0 ? (
          <p className="text-gray-500">표시할 데이터가 없습니다.</p>
        ) : (
          sorted.map(n => (
            <li key={n.noise_id} className="py-4 flex justify-between items-center">
              <div>
                <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-md">
                  {n.rasberry_id}
                </span>
                <span className="ml-4 text-lg font-medium">{n.what_noise}</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-red-600 font-bold">{n.dba} dB</span>

                <span className="text-sm text-gray-500 w-40 text-right whitespace-nowrap">
                  {new Date(n.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
