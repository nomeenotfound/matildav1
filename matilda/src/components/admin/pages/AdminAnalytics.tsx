import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any>({ 
    grossRevenue: 0, 
    totalPaidOrders: 0, 
    aov: 0, 
    recentOrders: [],
    latestTransactions: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    let analyticsData: any = null;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/analytics', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const result = await res.json();
        if (!result.error && (result.grossRevenue > 0 || (result.latestTransactions && result.latestTransactions.length > 0))) {
          analyticsData = result;
        }
      }
    } catch (err) {
      console.warn('Backend analytics fetch failed, attempting client Supabase fallback...', err);
    }

    if (!analyticsData && supabase) {
      try {
        const { data: orders } = await supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_at').order('created_at', { ascending: false });
        const allOrders = orders || [];
        const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'shipped');
        const grossRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const aov = paidOrders.length ? (grossRevenue / paidOrders.length) : 0;
        
        const recentOrdersMap = paidOrders.reduce((acc: any, order: any) => {
          const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[dateStr] = (acc[dateStr] || 0) + Number(order.total_amount || 0);
          return acc;
        }, {});

        const recentOrders = Object.keys(recentOrdersMap).map(date => ({
          date,
          revenue: recentOrdersMap[date]
        })).slice(-7);

        analyticsData = {
          grossRevenue,
          totalPaidOrders: paidOrders.length,
          aov,
          recentOrders,
          latestTransactions: allOrders.slice(0, 15)
        };
      } catch (sbErr) {
        console.warn('Client Supabase analytics error', sbErr);
      }
    }

    if (analyticsData) {
      setData({
        grossRevenue: analyticsData.grossRevenue || 0,
        totalPaidOrders: analyticsData.totalPaidOrders || 0,
        aov: analyticsData.aov || 0,
        recentOrders: analyticsData.recentOrders || [],
        latestTransactions: analyticsData.latestTransactions || []
      });
    }

    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Live polling every 10 seconds for real-time feed simulation
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">analytics overview.</h2>
        <div className="flex items-center gap-2 text-xs font-micro text-gray-500 uppercase tracking-widest">
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--border-admin)]" />
          ) : (
            <span className="flex items-center gap-1 text-[var(--border-admin)]"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Feed</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-4 sm:p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">gross revenue</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">₹{data.grossRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-4 sm:p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">total paid orders</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">{data.totalPaidOrders}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-4 sm:p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">avg order value</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">₹{Math.round(data.aov).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-6">Revenue Trend (Last 7 Days)</p>
          <div className="flex-1 min-h-[300px] w-full">
            {data.recentOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.recentOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--border-admin)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--border-admin)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{ stroke: 'var(--border-admin)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-admin-subtle)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--border-admin)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 font-micro text-xs">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500">Live Order Feed</p>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
            {data.latestTransactions && data.latestTransactions.length > 0 ? (
              data.latestTransactions.map((tx: any) => (
                <div key={tx.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-[var(--border-admin-subtle)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{tx.customer_name || 'Guest'}</p>
                      <p className="font-micro text-[10px] text-gray-400 tracking-widest">{tx.order_number}</p>
                    </div>
                    <p className="font-bold text-[var(--border-admin)]">₹{tx.total_amount}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[9px] font-micro uppercase tracking-widest px-2 py-1 rounded-md border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 font-micro text-xs">
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
