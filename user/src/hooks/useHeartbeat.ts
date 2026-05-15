import { useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';

function getVisitorId(): string {
  let id = localStorage.getItem('visitorId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitorId', id);
  }
  return id;
}

export function useHeartbeat() {
  const visitorId = useRef(getVisitorId());

  useEffect(() => {
    const sendHeartbeat = () => {
      if (document.visibilityState !== 'visible') return;
      apiClient.post('/dashboard/visits', {
        action: 'heartbeat',
        visitorId: visitorId.current,
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}
