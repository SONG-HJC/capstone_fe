// 정보 표시 컴포넌트
export default function InfoItem({ label, value }) {
  return (
    <div className="flex">
      <span className="w-24 font-medium text-gray-600 flex-shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
