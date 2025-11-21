import { useEffect } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

// ====================== TOASTS ==========================

export default function ToastContainer({ toasts, setToasts }) {
  const remove = id => setToasts(t => t.filter(x => x.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 space-y-3">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={() => remove(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 flex items-start">
      <InformationCircleIcon className="h-6 w-6 text-blue-500" />
      <div className="ml-3 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        <p className="text-sm text-gray-600">{toast.message}</p>
      </div>

      <button onClick={onDismiss}>
        <XMarkIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}