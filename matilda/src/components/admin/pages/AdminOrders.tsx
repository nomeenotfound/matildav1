import React, { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/orders', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, additionalData: any = {}) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status, ...additionalData })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status, ...additionalData });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'All') return true;
    return o.status === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">order desk.</h2>
        <div className="flex flex-wrap gap-2 font-micro text-[10px] uppercase tracking-widest">
          {['All', 'Pending', 'Paid', 'Shipped', 'Rejected'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 border border-[var(--border-admin)] rounded-full ${filter === f ? 'bg-[var(--border-admin)] text-white shadow-md' : 'text-[var(--border-admin)] hover:bg-[var(--border-admin-subtle)]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="font-micro uppercase tracking-widest text-xs">loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative">
              <button 
                onClick={() => setSelectedOrder(order)}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 text-gray-400 hover:text-[var(--border-admin)]"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <div className="flex justify-between items-start border-b border-[var(--border-admin-subtle)] pb-4 pr-8">
                <div>
                  <h3 className="font-display text-lg font-bold">{order.order_number}</h3>
                  <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> <span className={`font-micro uppercase tracking-widest text-[10px] px-2 py-0.5 ml-2 border rounded-full ${
                  order.status === 'pending' ? 'border-amber-500 text-amber-500 bg-amber-50' :
                  order.status === 'paid' ? 'border-green-500 text-green-500 bg-green-50' :
                  order.status === 'shipped' ? 'border-blue-500 text-blue-500 bg-blue-50' :
                  'border-red-500 text-red-500 bg-red-50'
                }`}>{order.status}</span></p>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Total:</strong> ₹{order.total_amount}</p>
                <p className="truncate"><strong>UTR:</strong> <span className="font-mono bg-gray-100 rounded-md px-2 py-0.5">{order.utr_number}</span></p>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border-admin-subtle)] grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleUpdateStatus(order.id, 'paid')} className="border border-green-600 text-green-600 font-micro uppercase tracking-widest text-[10px] py-2 rounded-full hover:bg-green-600 hover:text-white transition-colors">accept</button>
                    <button onClick={() => {
                      const reason = prompt("Rejection Reason:");
                      if (reason) handleUpdateStatus(order.id, 'rejected', { rejection_reason: reason });
                    }} className="border border-red-600 text-red-600 font-micro uppercase tracking-widest text-[10px] py-2 rounded-full hover:bg-red-600 hover:text-white transition-colors">reject</button>
                  </>
                )}
                {order.status === 'paid' && (
                  <button onClick={() => {
                    const tracking = prompt("Enter Tracking Number:");
                    if (tracking) handleUpdateStatus(order.id, 'shipped', { tracking_number: tracking });
                  }} className="col-span-2 border border-blue-600 text-blue-600 font-micro uppercase tracking-widest text-[10px] py-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors">mark shipped</button>
                )}
                <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="col-span-2 text-center border border-[var(--border-admin)] text-[var(--border-admin)] font-micro uppercase tracking-widest text-[10px] py-2 rounded-full hover:bg-[var(--border-admin)] hover:text-white transition-colors">
                  whatsapp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-[var(--border-admin)] shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl font-bold lowercase tracking-tighter mb-2">order {selectedOrder.order_number}</h3>
            <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-6">{new Date(selectedOrder.created_at).toLocaleString()}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body text-sm">
              <div>
                <h4 className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2 border-b pb-1">Customer Details</h4>
                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>Pincode:</strong> {selectedOrder.pincode}</p>
                <br/>
                <h4 className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2 border-b pb-1">Payment Info</h4>
                <p><strong>UTR:</strong> {selectedOrder.utr_number}</p>
                <p><strong>Total:</strong> ₹{selectedOrder.total_amount}</p>
                {selectedOrder.items && !Array.isArray(selectedOrder.items) && selectedOrder.items.promo && (
                   <p className="text-green-600"><strong>Promo:</strong> {selectedOrder.items.promo.code} (₹{selectedOrder.items.promo.discount} off)</p>
                )}
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                {selectedOrder.rejection_reason && <p className="text-red-500"><strong>Reason:</strong> {selectedOrder.rejection_reason}</p>}
                {selectedOrder.tracking_number && <p className="text-blue-500"><strong>Tracking:</strong> {selectedOrder.tracking_number}</p>}
              </div>
              
              <div>
                <h4 className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2 border-b pb-1">Ordered Items</h4>
                <ul className="space-y-3 mb-6">
                  {(() => {
                    const itemsArray = Array.isArray(selectedOrder.items) ? selectedOrder.items : (selectedOrder.items?.list || []);
                    return itemsArray.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-bold">{item.product?.title || 'Unknown Item'}</p>
                          {item.selectedVariant && <p className="text-xs text-gray-500">Variant: {item.selectedVariant.name}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">x{item.quantity || 1}</p>
                          <p className="font-bold">₹{item.product?.price || 0}</p>
                        </div>
                      </li>
                    ));
                  })()}
                </ul>

                {selectedOrder.screenshot_url && (
                  <div>
                    <h4 className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2 border-b pb-1">Payment Screenshot</h4>
                    <a href={selectedOrder.screenshot_url} target="_blank" rel="noreferrer" className="block border border-gray-200 rounded-lg overflow-hidden p-1 hover:border-[var(--border-admin)] transition-colors">
                      <img src={selectedOrder.screenshot_url} alt="Proof" className="w-full h-48 object-cover rounded-md" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 border border-gray-300 rounded-full font-micro uppercase tracking-widest text-[10px] hover:bg-gray-50">
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
