import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.token);
        navigate('/admin/orders');
      } else {
        setError('invalid credentials');
      }
    } catch (e) {
      setError('error logging in');
    }
  };

  return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-10 max-w-sm w-full shadow-lg">
        <h1 className="font-display text-3xl font-bold lowercase tracking-tighter mb-8 text-center text-[var(--border-admin)]">matilda suite</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="access code" 
            className="border border-[var(--border-admin)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-admin)] bg-white/50 backdrop-blur-sm"
          />
          {error && <p className="text-red-600 font-micro tracking-widest text-[10px] uppercase text-center">{error}</p>}
          <button type="submit" className="bg-[var(--border-admin)] text-white font-micro tracking-widest text-[10px] uppercase py-4 rounded-full hover:opacity-90 transition-opacity shadow-md">
            enter
          </button>
        </form>
      </div>
    </div>
  );
};
