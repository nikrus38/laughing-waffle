import React, { useEffect, useState } from 'react';

/** Показываем предупреждение, когда браузер потерял сеть. */
const ConnectionBanner: React.FC = () => {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[11px] font-medium text-amber-900"
    >
      Нет соединения. Открыты сохранённые экраны; начисления и матчинг станут доступны после
      подключения.
    </div>
  );
};

export default ConnectionBanner;
