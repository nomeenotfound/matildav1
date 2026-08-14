import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState({ grossRevenue: 0, totalPaidOrders: 0, aov: 0, recentOrders: [] });
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/analytics', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    }).then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">analytics.</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">gross revenue</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">₹{data.grossRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">total paid orders</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">{data.totalPaidOrders}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-8 shadow-sm">
          <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-2">avg order value</p>
          <p className="font-display text-4xl text-[var(--border-admin)]">₹{Math.round(data.aov).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-8 shadow-sm mt-8">
        <p className="font-micro uppercase tracking-widest text-[10px] text-gray-500 mb-6">Recent Revenue Trend</p>
        <div className="h-64 w-full">
          {data.recentOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.recentOrders}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{ fill: 'rgba(114, 47, 55, 0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-admin-subtle)' }} />
                <Bar dataKey="revenue" fill="var(--border-admin)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 font-micro text-xs">
              No revenue data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
