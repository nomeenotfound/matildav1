import React, { useEffect, useState } from 'react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchCustomers = () => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/customers', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlacklist = async (phone: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(phone)}/toggle-blacklist`, {
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">customer crm.</h2>

      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-micro text-xs whitespace-nowrap min-w-[800px]">
          <thead className="bg-white/50 border-b border-[var(--border-admin-subtle)] uppercase tracking-widest text-[10px] text-gray-500">
            <tr>
              <th className="p-6 font-normal">Name</th>
              <th className="p-6 font-normal">Phone</th>
              <th className="p-6 font-normal">Total Spent</th>
              <th className="p-6 font-normal">Orders</th>
              <th className="p-6 font-normal">Status</th>
              <th className="p-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.phone} className="border-b border-[var(--border-admin-subtle)] last:border-0 hover:bg-white/50 transition-colors">
                <td className="p-6 font-body text-sm font-bold">{c.name}</td>
                <td className="p-6">{c.phone}</td>
                <td className="p-6">₹{c.total_spent}</td>
                <td className="p-6">{c.order_count}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 border rounded-full ${c.is_blacklisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-green-500 text-green-500 bg-green-50'}`}>
                    {c.is_blacklisted ? 'Blacklisted' : 'Active'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => handleToggleBlacklist(c.phone)}
                    className="text-xs uppercase tracking-widest border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100"
                  >
                    {c.is_blacklisted ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
