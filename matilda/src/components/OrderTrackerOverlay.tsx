import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const OrderTrackerOverlay: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [statusData, setStatusData] = useState<{ status: string; tracking_info?: string; rejection_reason?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/status?order=${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setStatusData(data);
        }
      } catch (err) {
        console.error('Failed to fetch status', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  if (!orderNumber) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-[var(--bg-primary)] border border-[var(--border-main)] p-6 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-micro uppercase tracking-widest text-[var(--text-secondary)] mb-1">Order Tracker</h3>
          <p className="text-lg font-display">{orderNumber}</p>
        </div>
        <button onClick={() => { searchParams.delete('order'); setSearchParams(searchParams); }} className="text-xs font-micro uppercase tracking-widest border border-[var(--border-main)] px-2 py-1 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors">
          Close
        </button>
      </div>

      <div className="pt-4 border-t border-[var(--border-main)]">
        {loading && !statusData ? (
          <p className="text-sm font-micro lowercase text-[var(--text-secondary)]">checking status...</p>
        ) : statusData ? (
          <div className="text-sm font-micro lowercase">
            {statusData.status === 'pending' && <p className="text-amber-600">we received your screenshot. duha is checking it right now.</p>}
            {statusData.status === 'paid' && <p className="text-green-600">payment verified! your piece is being packed at the studio.</p>}
            {statusData.status === 'rejected' && <p className="text-red-600">we couldn't verify this payment: {statusData.rejection_reason}. please message us.</p>}
            {statusData.status === 'shipped' && <p className="text-blue-600">your piece has been shipped! tracking: {statusData.tracking_info}</p>}
          </div>
        ) : (
          <p className="text-sm font-micro lowercase text-red-500">order not found.</p>
        )}
      </div>
    </div>
  );
};
