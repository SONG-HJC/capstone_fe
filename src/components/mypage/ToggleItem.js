// 토글 스위치
export default function ToggleItem({ label, description, isEnabled, onToggle }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <span className="font-medium text-gray-700">{label}</span>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
          isEnabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}